// src/components/PageHeader.tsx
import React from "react";
import { Button, Form } from "react-bootstrap";
interface PageHeaderProps {
  title: string;
  searchPlaceholder?: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onMigrate: () => void;
  disableMigrate?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  searchPlaceholder,
  searchTerm,
  setSearchTerm,
  onMigrate,
  disableMigrate = false,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="mb-0" style={{ color: "#003DA5" }}>
        {title}
      </h4>

      <div className="d-flex gap-2 align-items-center">
        <Form.Control
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "350px", fontSize: "16px" }}
        />
        <Button
          variant="outline-success"
          onClick={onMigrate}
          disabled={disableMigrate}
          title="Migrate selected items"
        >
          <i className="bi bi-cloud-upload me-1" />
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
