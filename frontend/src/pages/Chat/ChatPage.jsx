// src/pages/Chat/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Paperclip, Send, User, Download, FileText, Image as ImageIcon } from 'lucide-react';
import './ChatPage.css';

// GIẢ ĐỊNH: ID của người dùng đang đăng nhập (Sẽ lấy từ JWT Token / AuthContext sau này)
// Bạn có thể đổi sang 20 để kiểm tra giao diện tự động đảo vai trò từ Buyer sang Seller
const currentUserId = 10; 

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
  const [conversations, setConversations] = useState(mockConversations);
  const [activeId, setActiveId] = useState(1); // Mặc định chọn hội thoại đầu tiên khi vào trang
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [inputText, setInputText] = useState("");
  
  const messagesEndRef = useRef(null);

  // Giai đoạn 2: Lấy danh sách tin nhắn khi đổi cuộc hội thoại
  useEffect(() => {
    setMessages(mockMessagesByConversation[activeId] || []);
  }, [activeId]);

  // Mẹo UX: Tự động cuộn xuống tin nhắn mới nhất khi khung chat cập nhật dữ liệu
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Giai đoạn 3: Xử lý gửi tin nhắn văn bản
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      senderId: currentUserId, // Định danh bằng ID người dùng hiện tại thay vì chuỗi cứng
      text: inputText,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileUrl: null,
      fileType: null
    };

    setMessages([...messages, newMsg]);
    setInputText("");

    // Cập nhật giao diện: Đẩy cuộc hội thoại vừa tương tác lên đầu danh sách và thay đổi lastMessage
    const updatedConversations = conversations.map(c => 
      c.id === activeId ? { ...c, lastMessage: inputText, updatedAt: "Vừa xong", unreadCount: 0 } : c
    );
    
    // Sắp xếp đưa cuộc hội thoại activeId lên đầu mảng danh sách bên trái
    const activeIndex = updatedConversations.findIndex(c => c.id === activeId);
    if (activeIndex > -1) {
      const [activeItem] = updatedConversations.splice(activeIndex, 1);
      updatedConversations.unshift(activeItem);
    }
    
    setConversations(updatedConversations);
  };

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
                  onClick={() => setActiveId(item.id)}
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
                      <span className="update-time-text">{item.updatedAt}</span>
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
                {messages.map((msg) => {
                  // Xác định tin nhắn của mình bằng cách kiểm tra ID người gửi
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`message-row-wrapper ${isMe ? 'row-me' : 'row-partner'}`}>
                      <div className={`message-bubble ${isMe ? 'bubble-me' : 'bubble-partner'}`}>
                        
                        {/* Text tin nhắn */}
                        <p className="message-text-content">{msg.text}</p>

                        {/* Nếu có đính kèm ảnh */}
                        {msg.fileUrl && msg.fileType === 'image' && (
                          <div className="attachment-image-box">
                            <ImageIcon size={16} /> 
                            <span className="file-link-mock">HÌNH ẢNH ĐÍNH KÈM</span>
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
                        <span className="message-time-stamp">{msg.createdAt}</span>
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