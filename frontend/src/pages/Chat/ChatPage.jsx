// src/pages/Chat/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Paperclip, Send, User, Download, FileText, Image as ImageIcon } from 'lucide-react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { jwtDecode } from 'jwt-decode';
import './ChatPage.css';

// Dữ liệu Mock Data mẫu mô phỏng cấu trúc trả về từ API /api/v1/conversations
const mockConversations = [
  {
    id: 1,
    userOneId: 10,       // Giả định ID 10 là Buyer
    userTwoId: 20,       // Giả định ID 20 là Seller
    userOneName: "Trần Thị Buyer (Dự án Web)",
    userOneAvatar: "",
    userTwoName: "Nguyễn Văn Seller (Thiết kế đồ họa)",
    userTwoAvatar: "",
    lastMessage: "Mình đã gửi bản demo logo mới, bạn xem qua nhé!",
    updatedAt: "5 phút trước",
    unreadCount: 2,
    status: "online"
  },
  {
    id: 2,
    userOneId: 30,       // Một khách hàng khác
    userTwoId: 10,       // Người dùng hiện tại (10) đóng vai trò là Seller trong hội thoại này
    userOneName: "Phạm Minh Khách Hàng",
    userOneAvatar: "",
    userTwoName: "Trần Thị Buyer (Dự án Web)",
    userTwoAvatar: "",
    lastMessage: "Cảm ơn bạn, để mình kiểm tra lại source code.",
    updatedAt: "2 giờ trước",
    unreadCount: 0,
    status: "offline"
  }
];

// Dữ liệu Mock Data mẫu mô phỏng cấu trúc trả về từ API /api/v1/conversations/{conversationId}/messages
const mockMessagesByConversation = {
  1: [
    { id: 101, senderId: 20, text: "Chào bạn, mình là seller phụ trách dự án thiết kế logo của bạn.", createdAt: "10:00", fileUrl: null, fileType: null },
    { id: 102, senderId: 10, text: "Chào bạn, mình muốn logo có tông màu xanh lá chủ đạo nhé.", createdAt: "10:02", fileUrl: null, fileType: null },
    { id: 103, senderId: 20, text: "Dạ vâng mình ghi nhận ạ. Đây là file phác thảo mẫu đính kèm.", createdAt: "10:30", fileUrl: "https://example.com/demo-logo.png", fileType: "image" },
    { id: 104, senderId: 20, text: "Mình đã gửi bản demo logo mới, bạn xem qua nhé!", createdAt: "10:31", fileUrl: null, fileType: null },
  ],
  2: [
    { id: 201, senderId: 10, text: "Mình đã bàn giao phần API đăng nhập rồi nha.", createdAt: "Hôm qua", fileUrl: null, fileType: null },
    { id: 202, senderId: 30, text: "Cảm ơn bạn, để mình kiểm tra lại source code.", createdAt: "Hôm qua", fileUrl: "https://example.com/source.zip", fileType: "file" },
  ]
};

const ChatPage = () => {
  const { conversationId } = useParams(); // Lấy ID từ URL ví dụ: /chat/:conversationId
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let currentUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUserId = decoded.userId || decoded.id || decoded.sub;
    } catch (error) {
      console.error("Token không hợp lệ hoặc đã hết hạn:", error);
    }
  }

  // Hàm tiện ích: Định dạng thời gian hiển thị (Format Time)
  const formatChatTime = (dateStr) => {
    if (!dateStr) return "Vừa xong";
    // Nếu là dữ liệu mock HH:mm thì trả về luôn
    if (/^\d{2}:\d{2}$/.test(dateStr)) return dateStr;

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const now = new Date();

      // Nếu là hôm nay: Hiển thị Giờ:Phút
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      // Nếu là hôm qua: Hiển thị "Hôm qua"
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";

      // Các ngày khác: Hiển thị Ngày/Tháng
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(conversationId ? parseInt(conversationId) : null);
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [inputText, setInputText] = useState("");

  const handleSelectConversation = (id) => {
    setActiveId(id);
    navigate(`/chat/${id}`); // Cập nhật URL khi đổi người chat
  };

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Khối bổ sung: Gọi API lấy toàn bộ danh sách cuộc hội thoại từ Backend
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/v1/conversations', {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.status === 'success' ? result.data : result;
          setConversations(data || []);

          // Nếu URL không chứa ID phòng cụ thể, tự động chọn phòng đầu tiên trong danh sách nhận về
          if (!conversationId && data && data.length > 0) {
            setActiveId(data[0].id);
          }
        } else {
          console.warn("Không thể lấy danh sách hội thoại từ Server, kích hoạt Mock Fallback.");
          setConversations(mockConversations);
          if (!conversationId) setActiveId(mockConversations[0]?.id || null);
        }
      } catch (error) {
        console.error("Lỗi kết nối API danh sách hội thoại:", error);
        setConversations(mockConversations);
        if (!conversationId) setActiveId(mockConversations[0]?.id || null);
      }
    };

    fetchConversations();
  }, [token, conversationId]);

  // Gọi API lấy lịch sử tin nhắn của cuộc hội thoại khi chuyển tab (activeId thay đổi)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeId) return;
      try {
        const response = await fetch(`/api/v1/conversations/${activeId}/messages`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          // Kiểm tra cấu trúc phản hồi bọc chung (success/data) hoặc mảng thuần túy
          const messagesData = result.status === 'success' ? result.data : result;
          setMessages(messagesData || []);
        } else {
          console.warn("Không thể tải tin nhắn từ server, kích hoạt Mock Fallback.");
          setMessages(mockMessagesByConversation[activeId] || []);
        }
      } catch (error) {
        console.error("Lỗi kết nối API lấy tin nhắn:", error);
        setMessages(mockMessagesByConversation[activeId] || []);
      }
    };

    fetchMessages();
  }, [activeId, token]);

  // Mẹo UX: Tự động cuộn xuống tin nhắn mới nhất khi khung chat cập nhật dữ liệu
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 1. 🟢 THÊM: Khởi tạo kết nối WebSocket ngay khi vừa vào trang Chat
  useEffect(() => {
    // Kết nối đến endpoint đã định nghĩa trong Spring Boot
    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);
    let chatSubscription = null;
    // 🛠️ SỬA LỖI: Gửi Token trong headers khi kết nối để Backend nhận diện Authentication
    stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
      console.log("Đã kết nối thành công WebSocket thành công!");
      stompClientRef.current = stompClient;

      // 🛠️ SỬA LỖI: Đăng ký nhận tin nhắn theo Topic ID cá nhân
      stompClient.subscribe(`/topic/messages/${currentUserId}`, (response) => {
        const incomingMessage = JSON.parse(response.body);
        if (incomingMessage.conversationId === activeIdRef.current) {
          // 🛡️ MÀNG LỌC AN TOÀN: Kiểm tra ID trùng trước khi cho phép render
          setMessages((prevMessages) => {
            const isExist = prevMessages.some(msg => msg.id === incomingMessage.id);
            if (isExist) {
              return prevMessages; // Đã tồn tại rồi thì đứng im, không nạp text thứ 2!
            }
            return [...prevMessages, incomingMessage]; // Chưa có thì nạp bình thường
          });
        }

        // Cập nhật tin nhắn cuối cùng (lastMessage) ngoài danh sách Sidebar
        setConversations((prevConversations) => {
          const updated = prevConversations.map(c =>
            c.id === incomingMessage.conversationId
              ? { ...c, lastMessage: incomingMessage.text, updatedAt: incomingMessage.createdAt }
              : c
          );
          return updated;
        });
      });
    }, (error) => {
      console.error("Lỗi kết nối WebSocket:", error);
    });
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, [currentUserId, token]); // Chạy lại nếu User thay đổi

  // 
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const activeChat = conversations.find(c => c.id === activeId);
    const partner = getPartnerDetails(activeChat);

    const messagePayload = {
      conversationId: activeId,
      senderId: currentUserId,
      receiverId: partner.id, // Bóc tách ID người nhận
      text: inputText,
      fileUrl: null,
      fileType: null
    };

    // Nếu đã kết nối WebSocket thành công, bắn payload lên Server
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.send("/app/chat.send", {}, JSON.stringify(messagePayload));
      setInputText(""); // Xóa thanh nhập liệu
    } else {
      alert("Kết nối máy chủ bị gián đoạn, đang thử kết nối lại...");
    }
  };

  // Hàm tiện ích: Tự động bóc tách thông tin đối tác (Partner) dựa trên vai trò của người đăng nhập hiện tại
  const getPartnerDetails = (conversation) => {
    const isCurrentUserUserOne = conversation.userOneId === currentUserId;
    return {
      id: isCurrentUserUserOne ? conversation.userTwoId : conversation.userOneId,
      name: isCurrentUserUserOne ? conversation.userTwoName : conversation.userOneName,
      avatar: isCurrentUserUserOne ? conversation.userTwoAvatar : conversation.userOneAvatar,
    };
  };

  // Tìm kiếm nhanh tên đối tác trong danh sách
  const filteredConversations = conversations.filter(c => {
    const partner = getPartnerDetails(c);
    return partner.name.toLowerCase().includes(searchText.toLowerCase());
  });

  // Giả lập đính kèm file (Sẽ map vào trường file_url trong cơ sở dữ liệu)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');

      const newMsg = {
        id: Date.now(),
        senderId: currentUserId,
        text: `Đã gửi file: ${file.name}`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fileUrl: "#", // Điểm neo URL tạm thời trước khi đồng bộ API Upload thực tế
        fileType: isImage ? "image" : "file"
      };

      setMessages([...messages, newMsg]);
    }
  };

  const activeChat = conversations.find(c => c.id === activeId);
  const activePartner = activeChat ? getPartnerDetails(activeChat) : null;

  return (
    <div className="chat-page-container">
      <div className="chat-layout-box">

        {/* ================= CỘT TRÁI: SIDEBAR DANH SÁCH ================= */}
        <div className="chat-sidebar">
          <div className="sidebar-search-area">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <div className="conversation-list-scroll">
            {filteredConversations.map((item) => {
              const partner = getPartnerDetails(item);
              return (
                <div
                  key={item.id}
                  className={`conversation-card ${item.id === activeId ? 'active-card' : ''}`}
                  onClick={() => handleSelectConversation(item.id)}
                >
                  <div className="avatar-wrapper">
                    {partner.avatar ? (
                      <img src={partner.avatar} alt="avatar" className="partner-img" />
                    ) : (
                      <div className="avatar-fallback"><User size={18} /></div>
                    )}
                    <span className={`status-dot ${item.status}`}></span>
                  </div>

                  <div className="card-info-content">
                    <div className="card-info-top">
                      <h4 className="partner-name-text">{partner.name}</h4>
                      <span className="update-time-text">{formatChatTime(item.updatedAt)}</span>
                    </div>
                    <div className="card-info-bottom">
                      <p className="last-message-preview">{item.lastMessage}</p>
                      {item.unreadCount > 0 && (
                        <span className="unread-badge-count">{item.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredConversations.length === 0 && (
              <p className="no-chat-notify">Không tìm thấy hội thoại nào.</p>
            )}
          </div>
        </div>

        {/* ================= CỘT PHẢI: CỬA SỔ NỘI DUNG CHAT ================= */}
        <div className="chat-window">
          {activeChat && activePartner ? (
            <>
              {/* Header cửa sổ chat */}
              <div className="chat-window-header">
                <div className="header-partner-info">
                  <div className="avatar-wrapper">
                    {activePartner.avatar ? (
                      <img src={activePartner.avatar} alt="avatar" className="partner-img" />
                    ) : (
                      <div className="avatar-fallback"><User size={20} /></div>
                    )}
                    <span className={`status-dot ${activeChat.status}`}></span>
                  </div>
                  <div>
                    <h3 className="header-name-title">{activePartner.name}</h3>
                    <span className="header-status-text">
                      {activeChat.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>
                <button className="view-profile-btn" onClick={() => alert(`Chuyển hướng đến hồ sơ đối tác có ID: ${activePartner.id}`)}>
                  Xem Hồ Sơ
                </button>
              </div>

              {/* Thân cửa sổ hiển thị tin nhắn */}
              <div className="chat-messages-body">
                {messages.map((msg, index) => {
                  // Xác định tin nhắn của mình bằng cách kiểm tra ID người gửi
                  const isMe = msg.senderId === currentUserId;

                  return (
                    /* 🟢 SỬA LỖI TRÙNG KEY: Kết hợp msg.id với biến index để bảo đảm luôn độc nhất */
                    <div key={`${msg.id || 'temp'}-${index}`} className={`message-row-wrapper ${isMe ? 'row-me' : 'row-partner'}`}>
                      <div className={`message-bubble ${isMe ? 'bubble-me' : 'bubble-partner'}`}>

                        {/* Text tin nhắn */}
                        {msg.text && <p className="message-text-content">{msg.text}</p>}

                        {/* 🟢 TỐI ƯU: Hiển thị hình ảnh thật thay vì dòng chữ Mock cũ */}
                        {msg.fileUrl && msg.fileType === 'image' && (
                          <div className="attachment-image-box" style={{ marginTop: '8px', maxWidth: '250px' }}>
                            <img
                              src={msg.fileUrl}
                              alt="Đính kèm từ đối tác"
                              className="chat-embedded-img"
                              style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
                              onClick={() => window.open(msg.fileUrl, '_blank')} // Click để mở ảnh tab mới
                            />
                          </div>
                        )}

                        {/* Nếu có đính kèm file tài liệu, zip... */}
                        {msg.fileUrl && msg.fileType === 'file' && (
                          <div className="attachment-file-box">
                            <div className="file-info-left">
                              <FileText size={16} />
                              <span>Tài liệu đính kèm</span>
                            </div>
                            <a href={msg.fileUrl} download className="download-icon-btn">
                              <Download size={14} />
                            </a>
                          </div>
                        )}

                        {/* Giờ gửi */}
                        <span className="message-time-stamp">{formatChatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Thanh nhập liệu cố định bên dưới */}
              <form className="chat-input-bar-form" onSubmit={handleSendMessage}>
                <label className="attach-file-label" htmlFor="chat-file-upload">
                  <Paperclip size={20} />
                  <input
                    type="file"
                    id="chat-file-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </label>

                <input
                  type="text"
                  className="chat-main-input"
                  placeholder="Nhập tin nhắn nhắn gửi đối tác..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <button type="submit" className="chat-send-submit-btn">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat-view">
              <p>Vui lòng chọn một cuộc hội thoại từ danh sách để bắt đầu trò chuyện.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPage;