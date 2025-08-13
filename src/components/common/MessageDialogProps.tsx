import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface MessageDialogProps {
  show: boolean;
  onClose: () => void;
  type: "success" | "error";
  title?: string;
  message: string;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  show,
  onClose,
  type,
  title,
  message,
}) => {
  const isSuccess = type === "success";

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
      animation={true}
      dialogClassName="custom-message-dialog"
    >
      <Modal.Header
        closeButton
        style={{
          backgroundColor: isSuccess ? "#d4edda" : "#f8d7da",
          borderBottom: "none",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "1rem 1.5rem",
          borderTopLeftRadius: "0.3rem",
          borderTopRightRadius: "0.3rem",
        }}
      >
        {isSuccess ? (
          <FaCheckCircle color="#155724" size={28} />
        ) : (
          <FaTimesCircle color="#721c24" size={28} />
        )}
        <Modal.Title
          style={{
            color: isSuccess ? "#155724" : "#721c24",
            fontWeight: 700,
            fontSize: "1.4rem",
            margin: 0,
          }}
        >
          {title || (isSuccess ? "Success" : "Error")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          color: isSuccess ? "#155724" : "#721c24",
          fontWeight: 500,
          fontSize: "1.15rem",
          textAlign: "center",
          padding: "1.75rem 2rem",
          lineHeight: 1.4,
          userSelect: "text",
        }}
      >
        {message}
      </Modal.Body>

      <Modal.Footer
        style={{
          borderTop: "none",
          padding: "1rem 1.5rem",
          justifyContent: "center",
        }}
      >
        <Button
          variant={isSuccess ? "success" : "danger"}
          onClick={onClose}
          style={{
            minWidth: "110px",
            fontWeight: 600,
            fontSize: "1.05rem",
            borderRadius: "0.3rem",
            padding: "0.5rem 1.25rem",
            boxShadow:
              "0 3px 6px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
          }}
          autoFocus
        >
          OK
        </Button>
      </Modal.Footer>

      {/* Optional: Custom CSS for modal size and shadow */}
      {/* <style jsx global>{`
        .custom-message-dialog .modal-content {
          max-width: 440px;
          border-radius: 0.5rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      `}</style> */}
    </Modal>
  );
};

export default MessageDialog;
