// src/admin/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  List,
  Tag,
  Table,
  Badge,
  Space,
} from "antd";
import {
  Line,
  Pie,
  Bar,
} from "@ant-design/plots";
import {
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import adminApi from "../api/adminApi";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [adminLogs, setAdminLogs] = useState([]);
  const [realtimeData, setRealtimeData] = useState([]);

  // ------------------------------------------------------------------
  // 1) 대시보드 + 관리자 로그 동시 로드
  // ------------------------------------------------------------------
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [dashRes, logRes] = await Promise.all([
          adminApi.getDashboard(7, 5),
          adminApi.getAdminLog(),
        ]);

        const d = dashRes.data || {};
        setData(d);

        const logList = (logRes.data || []).slice(0, 5);
        setAdminLogs(logList);

        // 실시간 그래프 초기값
        const initActive = d.summary?.activeUsers ?? 0;
        const now = new Date();
        setRealtimeData([
          {
            time: now.toLocaleTimeString(),
            activeUsers: initActive,
          },
        ]);
      } catch (e) {
        console.error(e);
      }
    };

    loadAll();
  }, []);

  // ------------------------------------------------------------------
  // 2) 실시간 접속자 WebSocket / 폴백 (간단 예시)
  // ------------------------------------------------------------------
  useEffect(() => {
    // 백엔드에서 WebSocket 구현했다면 이 부분 URI만 바꿔서 사용
    let socket = null;
    let interval = null;

    try {
      // 예시: ws://localhost:8080/ws/admin/active-users
      // 서버에서 { time: "HH:mm:ss", activeUsers: 123 } 형태로 push 해줄 때
      // socket = new WebSocket("ws://localhost:8080/ws/admin/active-users");
      //
      // socket.onmessage = (event) => {
      //   const msg = JSON.parse(event.data);
      //   setRealtimeData((prev) => [...prev.slice(-19), msg]); // 최근 20개만 유지
      // };

      // 🔁 지금은 서버 구현 전이라고 가정하고, 임시 시뮬레이션만 돌림
      interval = setInterval(() => {
        setRealtimeData((prev) => {
          const last = prev[prev.length - 1];
          const base = last?.activeUsers ?? 100;
          const next = Math.max(0, base + (Math.random() * 10 - 5)); // +-5 변동
          const now = new Date();
          const point = {
            time: now.toLocaleTimeString(),
            activeUsers: Math.round(next),
          };
          return [...prev.slice(-19), point];
        });
      }, 5000);
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (socket) socket.close();
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!data) return <div style={{ padding: 24 }}>Loading...</div>;

  const {
    summary = {},
    dailyJoins = [],
    loginStats = [],
    topNewsStocks = [],
    riskyUsers = [],
    failedLoginTop10 = [],
    todayNewsSummary = {},
  } = data;

  // ------------------------------------------------------------------
  // Summary 카드
  // ------------------------------------------------------------------
  const summaryCards = [
    {
      title: "총 사용자",
      value: summary.totalUsers,
      color: "#3b82f6",
      icon: <UserOutlined style={{ fontSize: 20 }} />,
    },
    {
      title: "활성 사용자",
      value: summary.activeUsers,
      color: "#10b981",
      icon: <CheckCircleOutlined style={{ fontSize: 20 }} />,
    },
    {
      title: "정지 사용자",
      value: summary.suspendedUsers,
      color: "#ef4444",
      icon: <StopOutlined style={{ fontSize: 20 }} />,
    },
    {
      title: "미인증 사용자",
      value: summary.waitingVerifyUsers,
      color: "#f59e0b",
      icon: <MailOutlined style={{ fontSize: 20 }} />,
    },
    {
      title: "위험 사용자",
      value: summary.dangerUsers,
      color: "#dc2626",
      icon: <ExclamationCircleOutlined style={{ fontSize: 20 }} />,
    },
    {
      title: "뉴스 수",
      value: summary.totalNews,
      color: "#6366f1",
      icon: <FileTextOutlined style={{ fontSize: 20 }} />,
    },
  ];

  // ------------------------------------------------------------------
  // Line Chart (최근 7일 가입자)
  // ------------------------------------------------------------------
  const lineConfig = {
    data: dailyJoins,
    xField: "joinDate",
    yField: "count",
    smooth: true,
    height: 250,
    autoFit: true,
    point: { size: 4, shape: "circle" },
    areaStyle: () => ({
      fill: "l(270) 0:#3b82f6 1:#93c5fd",
      fillOpacity: 0.4,
    }),
  };

  // ------------------------------------------------------------------
  // Pie Chart (로그인 성공/실패)
  // ------------------------------------------------------------------
  const pieConfig = {
    data: loginStats,
    angleField: "count",
    colorField: "status",
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-30%",
      content: "{count}",
      style: { fontSize: 14 },
    },
    interactions: [{ type: "element-active" }],
  };

  // ------------------------------------------------------------------
  // Bar Chart (뉴스 많은 종목 Top 5)
  // ------------------------------------------------------------------
  const barNewsConfig = {
    data: topNewsStocks,
    xField: "newsCount",
    yField: "stockName",
    height: 300,
    label: { position: "right", style: { fill: "#000" } },
    barStyle: { fill: "#6366f1" },
  };

  // ------------------------------------------------------------------
  // 실시간 접속자 그래프
  // ------------------------------------------------------------------
  const realtimeConfig = {
    data: realtimeData,
    xField: "time",
    yField: "activeUsers",
    height: 220,
    autoFit: true,
    smooth: true,
    point: { size: 3, shape: "circle" },
    areaStyle: () => ({
      fill: "l(270) 0:#22c55e 1:#bbf7d0",
      fillOpacity: 0.4,
    }),
  };

  // ------------------------------------------------------------------
  // 실패 로그인 Top 10 테이블
  // ------------------------------------------------------------------
  const failedColumns = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "실패 횟수",
      dataIndex: "failCount",
      key: "failCount",
      width: 80,
    },
    {
      title: "마지막 실패 시간",
      dataIndex: "lastFailedAt",
      key: "lastFailedAt",
      width: 160,
    },
  ];

  // 관리자 로그 액션 텍스트 간단 매핑 (자세한 건 AdminActionLogs 쪽에서)
  const actionLabel = (action) => {
    switch (action) {
      case "CLEAR_TOKENS":
        return "전체 토큰 초기화";
      case "TOKEN_DELETE":
        return "개별 토큰 삭제";
      case "RESET_FAIL":
        return "로그인 실패 초기화";
      case "SUSPEND":
        return "계정 정지";
      case "UNSUSPEND":
        return "정지 해제";
      case "ROLE_CHANGE":
        return "권한 변경";
      case "FORCE_LOGOUT":
        return "강제 로그아웃";
      default:
        return action || "기타";
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>관리자 대시보드</h2>

      {/* ========================= */}
      {/* 1. Summary 영역 */}
      {/* ========================= */}
      <Row gutter={[16, 16]}>
        {summaryCards.map((card, i) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={4} key={i}>
            <Card
              style={{
                background: card.color,
                color: "white",
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 500 }}>{card.title}</div>
              <div style={{ fontSize: 26, fontWeight: "bold" }}>
                {card.value}
              </div>
              <div style={{ marginTop: 10 }}>{card.icon}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ========================= */}
      {/* 2. 가입자 / 실시간 접속 */}
      {/* ========================= */}
      <Row gutter={16} style={{ marginTop: 30 }}>
        <Col xs={24} lg={16}>
          <Card title="최근 7일 가입자 수">
            <Line {...lineConfig} />
          </Card>
        </Col>

      </Row>

      {/* ========================= */}
      {/* 3. 로그인 / 실패 Top10 */}
      {/* ========================= */}
      <Row gutter={16} style={{ marginTop: 30 }}>
        <Col xs={24} lg={8}>
          <Card title="로그인 성공/실패 비율">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* ========================= */}
      {/* 4. 위험 사용자 / 관리자 로그 */}
      {/* ========================= */}
      <Row gutter={16} style={{ marginTop: 30 }}>

        <Col xs={24} lg={12}>
          <Card title="최근 관리자 작업 로그 (5건)">
            <List
              dataSource={adminLogs}
              locale={{ emptyText: "관리자 작업 로그가 없습니다." }}
              renderItem={(log) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag>{actionLabel(log.ACTION || log.action)}</Tag>
                        <span>{log.ADMIN_EMAIL || log.adminEmail}</span>
                      </Space>
                    }
                    description={
                      <>
                        <div>시간: {log.CREATED_AT || log.createdAt}</div>
                        <div>
                          대상: {log.TARGET_EMAIL || log.targetEmail || "-"}
                        </div>
                        <div style={{ whiteSpace: "pre-line" }}>
                          {log.DETAIL || log.detail}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* ========================= */}
      {/* 5. 뉴스 Top5 + 오늘의 뉴스 요약 */}
      {/* ========================= */}
      <Row gutter={16} style={{ marginTop: 30, marginBottom: 30 }}>
        <Col xs={24} lg={12}>
          <Card title="뉴스 많은 종목 Top 5">
            <Bar {...barNewsConfig} />
          </Card>
        </Col>

      </Row>
    </div>
  );
}
