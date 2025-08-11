// src/components/VariableModal.tsx

import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface VariableModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const VariableModal: React.FC<VariableModalProps> = ({
  show,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    VariableName: "",
    IntegrationFlow: "",
    Visibility: "Public",
    RetainUntil: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Variable</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Variable Name</Form.Label>
            <Form.Control
              type="text"
              name="VariableName"
              value={formData.VariableName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Integration Flow</Form.Label>
            <Form.Control
              type="text"
              name="IntegrationFlow"
              value={formData.IntegrationFlow}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Visibility</Form.Label>
            <Form.Select
              name="Visibility"
              value={formData.Visibility}
              onChange={handleChange}
            >
              <option value="Global">Global</option>
              <option value="Integration Flow">Integration Flow</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Retain Until</Form.Label>
            <Form.Control
              type="date"
              name="RetainUntil"
              value={formData.RetainUntil}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VariableModal;
