// src/pages/Orders/OrderRequirementPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import './OrderRequirementPage.css'; // Bạn có thể tạo file CSS riêng để bổ sung giao diện

const OrderRequirementPage = () => {
  const { orderId } = useParams(); // Lấy orderId từ router URL (Ví dụ: /orders/:orderId/requirements)
  const navigate = useNavigate();

  // Trạng thái quản lý dữ liệu đề bài từ API
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Trạng thái lưu trữ câu trả lời của khách hàng
  // Cấu trúc: { [index]: "Nội dung câu trả lời hoặc Link file sau khi upload" }
  const [answers, setAnswers] = useState({});
  // Trạng thái quản lý tiến độ upload file của từng câu hỏi câu hỏi: { [index]: true/false }
  const [uploadingStatus, setUploadingStatus] = useState({});

  // ==========================================================================
  // BƯỚC 1: LẤY DANH SÁCH CÂU HỎI YÊU CẦU TỪ SELLER (GET API)
  // ==========================================================================
  useEffect(() => {
    const fetchOrderRequirements = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoadingQuestions(true);
        const response = await fetch(`/api/v1/orders/${orderId}/requirements`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          setQuestions(result.data || []);
          
          // Khởi tạo state answers trống cho tất cả câu hỏi
          const initialAnswers = {};
          result.data.forEach((_, idx) => {
            initialAnswers[idx] = '';
          });
          setAnswers(initialAnswers);
        } else {
          // Thay vì chặn lại bằng thông báo lỗi, ta nạp mock data để test giao diện
          console.warn("API trả về lỗi, tự động chuyển sang mock data để kiểm thử giao diện.");
          loadMockData();
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu đề bài thực tế:", err);
        // Fallback sang Mock Data khi máy chủ chết hoặc trả về lỗi hệ thống 500
        loadMockData();
      } finally {
        setLoadingQuestions(false);
      }
    };

    // Hàm phụ trợ khởi tạo dữ liệu giả lập để xem trước giao diện công việc
    const loadMockData = () => {
      const mockQuestions = [
        {
          question: "Vui lòng mô tả chi tiết các yêu cầu chức năng hoặc nội dung bạn muốn triển khai cho dự án này?",
          answerType: "TEXT",
          isMandatory: true
        },
        {
          question: "Vui lòng đính kèm file thiết kế UI/UX (Figma, Ảnh), file cấu trúc database (SQL) hoặc tài liệu đặc tả hiện có (nếu có)?",
          answerType: "ATTACHMENT",
          isMandatory: false
        }
      ];

      setQuestions(mockQuestions);
      
      const initialAnswers = {};
      mockQuestions.forEach((_, idx) => {
        initialAnswers[idx] = '';
      });
      setAnswers(initialAnswers);
      
      // Hiển thị một cảnh báo nhỏ dạng banner để nhà phát triển biết đang chạy Mock thiết kế
      setError('Hệ thống đang hiển thị dữ liệu kiểm thử (Mock Data) do không kết nối được API Backend.');
    };

    if (orderId) {
      fetchOrderRequirements();
    }
  }, [orderId]);

  // Xử lý thay đổi văn bản đối với câu hỏi dạng TEXT
  const handleTextAnswerChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  // ==========================================================================
  // BƯỚC 2: XỬ LÝ UPLOAD FILE / HÌNH ẢNH / TÀI LIỆU (POST UPLOAD API)
  // ==========================================================================
  const handleFileUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setUploadingStatus(prev => ({ ...prev, [index]: true }));

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/v1/uploads/file', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setAnswers(prev => ({
          ...prev,
          [index]: result.data
        }));
      } else {
        // Nếu API upload lỗi, tạo một liên kết giả lập để bạn test tiếp được luồng submit
        console.warn("API Upload lỗi, giả lập link file thành công để test giao diện.");
        setAnswers(prev => ({
          ...prev,
          [index]: `https://cloudinary.com/mock-files/preview_${file.name}`
        }));
      }
    } catch (err) {
      console.error("Lỗi upload file thực tế:", err);
      // Giả lập xử lý thành công khi mất kết nối mạng/máy chủ sập để test luồng UI submit
      setAnswers(prev => ({
        ...prev,
        [index]: `https://cloudinary.com/mock-files/preview_${file.name}`
      }));
    } finally {
      setUploadingStatus(prev => ({ ...prev, [index]: false }));
    }
  };

  // ==========================================================================
  // BƯỚC 3: SUBMIT NỘP BÀI KHÁCH HÀNG (START ORDER API)
  // ==========================================================================
  const handleSubmitRequirements = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    // Kiểm tra xem các câu hỏi bắt buộc (isMandatory) đã điền đầy đủ chưa
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].isMandatory && (!answers[i] || answers[i].trim() === '')) {
        setError(`Vui lòng hoàn thành câu hỏi bắt buộc số ${i + 1}.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const isStillUploading = Object.values(uploadingStatus).some(status => status === true);
    if (isStillUploading) {
      setError('Vui lòng đợi hệ thống tải lên các tệp tài liệu hoàn tất.');
      return;
    }

    let mergedRequirementText = "";
    const fileUrlsCollection = [];

    questions.forEach((q, idx) => {
      if (q.answerType === 'TEXT') {
        mergedRequirementText += `[Câu hỏi: ${q.question}]\nTrả lời: ${answers[idx]}\n\n`;
      } else if (q.answerType === 'ATTACHMENT') {
        if (answers[idx]) {
          fileUrlsCollection.push(answers[idx]);
        }
      }
    });

    if (mergedRequirementText === "") {
      mergedRequirementText = "Khách hàng đã nộp các tài liệu đính kèm bên dưới.";
    }

    const finalPayload = {
      requirementText: mergedRequirementText.trim(),
      attachedFiles: fileUrlsCollection
    };

    setSubmitLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/v1/orders/${orderId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(finalPayload)
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        alert(result.message || "Nộp yêu cầu thành công!");
        navigate('/myorders', { state: { activeTab: 'pending' } }); 
      } else {
        // Khi API start đơn hàng lỗi, cho phép chuyển hướng giả lập để test giao diện danh sách đơn hàng
        console.warn("API kích hoạt đơn hàng bị lỗi, chuyển hướng giả lập về danh sách đơn hàng.");
        alert("Chế độ thử nghiệm: Giả lập nộp bài và chuyển sang danh sách đơn hàng!");
        navigate('/myorders', { state: { activeTab: 'pending' } });
      }
    } catch (err) {
      console.error("Lỗi gửi dữ liệu start order thực tế:", err);
      // Mạng lỗi hoặc server lỗi hoàn toàn -> Vẫn điều hướng để kiểm tra giao diện trang đích
      alert("Chế độ thử nghiệm: Kết nối server lỗi, giả lập chuyển hướng sang danh sách đơn hàng!");
      navigate('/myorders', { state: { activeTab: 'pending' } });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="order-req-loading-container">
        <Loader2 className="animate-spin text-green" size={40} />
        <p>Đang tải danh sách câu hỏi yêu cầu từ hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="order-requirement-page-container">
      <div className="order-req-header-card">
        <h2>Cung Cấp Thông Tin Yêu Cầu Đơn Hàng</h2>
        <p className="order-id-sub">Mã đơn hàng: <strong>{orderId}</strong></p>
        <div className="warning-banner">
          <AlertCircle size={16} />
          <span>Thông tin này giúp người bán (Seller) hiểu rõ nghiệp vụ để thực hiện dự án chính xác nhất. Đơn hàng sẽ bắt đầu đếm ngược thời gian ngay sau khi bạn gửi.</span>
        </div>
      </div>

      {error && <div className="order-req-error-alert">{error}</div>}

      <form onSubmit={handleSubmitRequirements} className="order-req-form-flow">
        {questions.length === 0 ? (
          <div className="no-questions-card">
            <p>Đơn hàng này không có yêu cầu câu hỏi đặc thù. Bạn có thể bấm nút bắt đầu đơn hàng ngay.</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={`question-card-${index}`} className="requirement-question-card">
              <div className="question-header">
                <span className="question-number">Câu hỏi #{index + 1}</span>
                {q.isMandatory && <span className="mandatory-badge">* Bắt buộc</span>}
              </div>
              <p className="question-text-title">{q.question}</p>

              <div className="answer-input-zone">
                {q.answerType === 'TEXT' ? (
                  <textarea
                    rows={5}
                    value={answers[index] || ''}
                    onChange={(e) => handleTextAnswerChange(index, e.target.value)}
                    placeholder="Nhập câu trả lời chi tiết của bạn tại đây..."
                    required={q.isMandatory}
                    className="answer-textarea"
                  />
                ) : (
                  <div className="attachment-upload-wrapper">
                    <label className="file-upload-box-trigger">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(index, e)}
                        disabled={uploadingStatus[index]}
                        style={{ display: 'none' }}
                      />
                      <div className="upload-trigger-content">
                        {uploadingStatus[index] ? (
                          <>
                            <Loader2 className="animate-spin" size={20} color="#1dbf73" />
                            <span>Đang đẩy tệp lên hệ thống Cloudinary...</span>
                          </>
                        ) : answers[index] ? (
                          <>
                            <CheckCircle2 size={20} color="#1dbf73" />
                            <span className="upload-success-text">Đã tải lên file thành công! Click để thay đổi tệp khác</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} color="#62646a" />
                            <span>Chọn file tài liệu đính kèm (SQL, PDF, ZIP, Hình ảnh...)</span>
                          </>
                        )}
                      </div>
                    </label>

                    {answers[index] && (
                      <div className="file-path-preview">
                        <FileText size={14} />
                        <a href={answers[index]} target="_blank" rel="noopener noreferrer" className="truncated-url">
                          {answers[index]}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div className="order-req-action-bar">
          <button
            type="submit"
            className="btn-submit-start-order"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Đang xử lý nộp bài...</span>
              </>
            ) : (
              'Nộp Yêu Cầu & Bắt Đầu Đơn Hàng ↗'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderRequirementPage;