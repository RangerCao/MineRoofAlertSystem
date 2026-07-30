#!/bin/bash
# ============================================
# 煤矿顶板预警系统 - 阿里云 ECS 部署脚本
# 使用方式: ./deploy.sh <ECS_IP> [SSH_USER] [SSH_PORT]
# ============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# 参数解析
ECS_IP="${1}"
SSH_USER="${2:-root}"
SSH_PORT="${3:-22}"
REMOTE_DIR="/opt/mine-roof-alert"
PROJECT_NAME="MineRoofAlertSystem"

if [ -z "$ECS_IP" ]; then
  echo -e "${RED}错误: 请提供 ECS 服务器 IP${NC}"
  echo "用法: ./deploy.sh <ECS_IP> [SSH用户] [SSH端口]"
  echo "示例: ./deploy.sh 47.100.xxx.xxx root 22"
  exit 1
fi

SSH_CMD="ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no ${SSH_USER}@${ECS_IP}"
SCP_CMD="scp -P ${SSH_PORT} -o StrictHostKeyChecking=no"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  煤矿顶板预警系统 - ECS 部署${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "目标服务器: ${GREEN}${SSH_USER}@${ECS_IP}:${SSH_PORT}${NC}"
echo -e "部署目录:   ${GREEN}${REMOTE_DIR}${NC}"
echo ""

# 步骤1: 测试 SSH 连接
echo -e "${YELLOW}[1/5] 测试 SSH 连接...${NC}"
if ! $SSH_CMD "echo '连接成功'" > /dev/null 2>&1; then
  echo -e "${RED}SSH 连接失败，请检查:${NC}"
  echo "  - ECS IP 是否正确"
  echo "  - SSH 端口是否开放（安全组规则）"
  echo "  - SSH 用户名/密钥是否正确"
  exit 1
fi
echo -e "${GREEN}  ✓ SSH 连接正常${NC}"

# 步骤2: 服务器初始化（安装 Docker）
echo -e "${YELLOW}[2/5] 检查服务器环境...${NC}"
$SSH_CMD << 'REMOTE_INIT'
  # 检查 Docker
  if ! command -v docker &> /dev/null; then
    echo "INSTALL_DOCKER"
  else
    echo "DOCKER_OK"
    docker --version
  fi

  # 检查 docker-compose
  if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "INSTALL_COMPOSE"
  else
    echo "COMPOSE_OK"
  fi

  # 检查磁盘空间
  df -h / | tail -1
REMOTE_INIT

# 如果需要安装 Docker，执行初始化
NEED_DOCKER=$($SSH_CMD "command -v docker &> /dev/null && echo NO || echo YES")
if [ "$NEED_DOCKER" = "YES" ]; then
  echo -e "${YELLOW}  正在安装 Docker...${NC}"
  $SSH_CMD << 'INSTALL_DOCKER'
    # 阿里云镜像加速安装Docker
    curl -fsSL https://get.docker.com | bash -s docker --mirror aliyun
    systemctl start docker
    systemctl enable docker

    # 配置阿里云 Docker 镜像加速
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF
    systemctl daemon-reload
    systemctl restart docker

    # 安装 docker-compose 插件
    apt-get update -qq && apt-get install -y -qq docker-compose-plugin 2>/dev/null || \
    yum install -y -q docker-compose-plugin 2>/dev/null || \
    pip3 install docker-compose 2>/dev/null

    echo "Docker 安装完成"
    docker --version
INSTALL_DOCKER
  echo -e "${GREEN}  ✓ Docker 安装完成${NC}"
else
  echo -e "${GREEN}  ✓ Docker 已安装${NC}"
fi

# 步骤3: 上传项目文件
echo -e "${YELLOW}[3/5] 上传项目文件到 ECS...${NC}"

# 先获取项目根目录（脚本所在目录的上级）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 创建远程目录
$SSH_CMD "mkdir -p ${REMOTE_DIR}"

# 打包项目（排除不需要的文件）
echo "  正在打包项目..."
TEMP_TAR="/tmp/${PROJECT_NAME}-deploy.tar.gz"

tar -czf "$TEMP_TAR" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='__pycache__' \
  --exclude='.venv' \
  --exclude='venv' \
  --exclude='dist' \
  --exclude='.idea' \
  --exclude='.vscode' \
  --exclude='*.log' \
  -C "$(dirname "$PROJECT_DIR")" \
  "$(basename "$PROJECT_DIR")"

# 上传
echo "  正在传输（可能需要几分钟）..."
$SCP_CMD "$TEMP_TAR" "${SSH_USER}@${ECS_IP}:/tmp/${PROJECT_NAME}-deploy.tar.gz"

# 远程解压
$SSH_CMD << REMOTE_DEPLOY
  cd ${REMOTE_DIR}
  # 备份旧版本
  if [ -d "${REMOTE_DIR}/frontend" ] || [ -d "${REMOTE_DIR}/backend" ]; then
    BACKUP_DIR="${REMOTE_DIR}/backup_\$(date +%Y%m%d_%H%M%S)"
    echo "备份旧版本到 \$BACKUP_DIR"
    mkdir -p "\$BACKUP_DIR"
    [ -d "${REMOTE_DIR}/frontend" ] && mv ${REMOTE_DIR}/frontend "\$BACKUP_DIR/"
    [ -d "${REMOTE_DIR}/backend" ] && mv ${REMOTE_DIR}/backend "\$BACKUP_DIR/"
    [ -f "${REMOTE_DIR}/docker-compose.yml" ] && mv ${REMOTE_DIR}/docker-compose.yml "\$BACKUP_DIR/"
  fi

  # 解压新版本
  tar -xzf /tmp/${PROJECT_NAME}-deploy.tar.gz -C ${REMOTE_DIR} --strip-components=1
  rm -f /tmp/${PROJECT_NAME}-deploy.tar.gz
  echo "解压完成"
  ls -la ${REMOTE_DIR}
REMOTE_DEPLOY

# 清理本地临时文件
rm -f "$TEMP_TAR"

echo -e "${GREEN}  ✓ 文件上传完成${NC}"

# 步骤4: 构建并启动容器
echo -e "${YELLOW}[4/5] 构建 Docker 镜像并启动服务...${NC}"
$SSH_CMD << REMOTE_BUILD
  cd ${REMOTE_DIR}

  # 停止旧容器（如果有）
  docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

  # 构建镜像
  echo ">>> 构建前端镜像..."
  docker compose build frontend || docker-compose build frontend

  echo ">>> 构建后端镜像..."
  docker compose build backend || docker-compose build backend

  # 拉取基础镜像并启动
  echo ">>> 启动所有服务..."
  docker compose up -d || docker-compose up -d

  # 等待服务启动
  sleep 5

  # 显示状态
  echo ""
  echo "=== 容器状态 ==="
  docker compose ps 2>/dev/null || docker-compose ps
REMOTE_BUILD
echo -e "${GREEN}  ✓ 服务启动完成${NC}"

# 步骤5: 验证部署
echo -e "${YELLOW}[5/5] 验证部署状态...${NC}"
sleep 3
$SSH_CMD << REMOTE_CHECK
  echo "=== 容器运行状态 ==="
  docker compose ps 2>/dev/null || docker-compose ps
  echo ""
  echo "=== 端口监听 ==="
  ss -tlnp | grep -E ':(80|8000|5432|6379|8086) ' || netstat -tlnp | grep -E ':(80|8000|5432|6379|8086) '
  echo ""
  echo "=== 前端访问测试 ==="
  curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80 || echo "前端未响应"
  echo ""
  echo "=== 后端 API 测试 ==="
  curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:8000/api/health 2>/dev/null || echo "后端未响应"
REMOTE_CHECK

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "  前端地址:  ${GREEN}http://${ECS_IP}${NC}"
echo -e "  后端 API:  ${GREEN}http://${ECS_IP}:8000/api/${NC}"
echo ""
echo -e "  常用命令:"
echo -e "    查看日志:  ${CYAN}ssh ${SSH_USER}@${ECS_IP} 'cd ${REMOTE_DIR} && docker compose logs -f'${NC}"
echo -e "    重启服务:  ${CYAN}ssh ${SSH_USER}@${ECS_IP} 'cd ${REMOTE_DIR} && docker compose restart'${NC}"
echo -e "    停止服务:  ${CYAN}ssh ${SSH_USER}@${ECS_IP} 'cd ${REMOTE_DIR} && docker compose down'${NC}"
echo ""
