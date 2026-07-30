#!/bin/bash
# ============================================
# 阿里云 ECS 服务器初始化脚本
# 首次登录 ECS 后执行此脚本
# 使用方式: ssh root@<ECS_IP> 'bash -s' < init-server.sh
# 或:       ssh root@<ECS_IP> < init-server.sh
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ECS 服务器初始化${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 系统更新
echo -e "${YELLOW}[1/5] 系统更新...${NC}"
if command -v apt-get &> /dev/null; then
  apt-get update -qq
  apt-get upgrade -y -qq
  PKG_MANAGER="apt"
elif command -v yum &> /dev/null; then
  yum update -y -q
  PKG_MANAGER="yum"
else
  echo -e "${RED}不支持的系统${NC}"
  exit 1
fi
echo -e "${GREEN}  ✓ 系统已更新${NC}"

# 2. 安装基础工具
echo -e "${YELLOW}[2/5] 安装基础工具...${NC}"
if [ "$PKG_MANAGER" = "apt" ]; then
  apt-get install -y -qq curl wget git vim htop unzip tar
else
  yum install -y -q curl wget git vim htop unzip tar
fi
echo -e "${GREEN}  ✓ 基础工具已安装${NC}"

# 3. 安装 Docker
echo -e "${YELLOW}[3/5] 安装 Docker...${NC}"
if ! command -v docker &> /dev/null; then
  # 使用阿里云镜像安装
  curl -fsSL https://get.docker.com | bash -s docker --mirror aliyun
  systemctl start docker
  systemctl enable docker
  echo -e "${GREEN}  ✓ Docker 已安装${NC}"
else
  echo -e "${GREEN}  ✓ Docker 已存在${NC}"
fi
docker --version

# 4. 安装 docker-compose
echo -e "${YELLOW}[4/5] 安装 Docker Compose...${NC}"
if ! docker compose version &> /dev/null; then
  if [ "$PKG_MANAGER" = "apt" ]; then
    apt-get install -y -qq docker-compose-plugin
  else
    # 手动安装 docker-compose
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
    curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
      -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
  fi
  echo -e "${GREEN}  ✓ Docker Compose 已安装${NC}"
else
  echo -e "${GREEN}  ✓ Docker Compose 已存在${NC}"
fi

# 5. 配置 Docker 镜像加速（阿里云）
echo -e "${YELLOW}[5/5] 配置 Docker 镜像加速...${NC}"
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://registry.docker-cn.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  }
}
EOF
systemctl daemon-reload
systemctl restart docker
echo -e "${GREEN}  ✓ 镜像加速已配置${NC}"

# 创建部署目录
mkdir -p /opt/mine-roof-alert

# 配置防火墙
echo ""
echo -e "${YELLOW}配置防火墙...${NC}"
if command -v firewall-cmd &> /dev/null; then
  firewall-cmd --permanent --add-port=80/tcp   # 前端
  firewall-cmd --permanent --add-port=8000/tcp  # 后端 API
  firewall-cmd --permanent --add-port=5432/tcp  # PostgreSQL（可选，建议仅内网）
  firewall-cmd --permanent --add-port=6379/tcp  # Redis（可选，建议仅内网）
  firewall-cmd --permanent --add-port=8086/tcp  # InfluxDB（可选，建议仅内网）
  firewall-cmd --reload
  echo -e "${GREEN}  ✓ 防火墙规则已添加${NC}"
elif command -v ufw &> /dev/null; then
  ufw allow 80/tcp
  ufw allow 8000/tcp
  ufw allow 5432/tcp
  ufw allow 6379/tcp
  ufw allow 8086/tcp
  echo -e "${GREEN}  ✓ UFW 规则已添加${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  服务器初始化完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "接下来请:"
echo -e "  1. 在阿里云安全组中开放以下端口:"
echo -e "     ${YELLOW}80   (HTTP 前端)${NC}"
echo -e "     ${YELLOW}8000 (API 后端)${NC}"
echo -e "  2. 运行部署脚本: ${CYAN}./scripts/deploy.sh <ECS_IP>${NC}"
echo ""
echo -e "${RED}安全提醒:${NC} 数据库端口(5432/6379/8086)不建议对公网开放"
echo -e "建议仅在安全组中开放 80 和 8000 端口"
echo ""
