import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, message } from 'antd';
import type { CreateScanRequest, ScanType } from '../../types/scan';
import { scanService } from '../../services/scanService';

const { TextArea } = Input;
const { Option } = Select;

interface ScanFormProps {
  patientId: number;
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const ScanForm: React.FC<ScanFormProps> = ({
  patientId,
  open,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const payload: CreateScanRequest = {
        scan_type: values.scan_type as ScanType,
        notes: values.notes,
      };

      await scanService.create(patientId, payload);
      message.success('Tạo ca chụp mới thành công!');
      form.resetFields();
      onSuccess();
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        message.error(axiosError.response?.data?.error || 'Tạo ca chụp thất bại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo ca chụp mới"
      open={open}
      onCancel={onCancel}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Tạo ca chụp
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ scan_type: 'xray' }}>
        <Form.Item
          name="scan_type"
          label="Loại ca chụp"
          rules={[{ required: true, message: 'Vui lòng chọn loại ca chụp!' }]}
        >
          <Select placeholder="Chọn loại chụp">
            <Option value="xray">X-Ray (Chụp X-quang)</Option>
            <Option value="mri">MRI (Chụp Cộng hưởng từ)</Option>
            <Option value="ct_scan">CT Scan (Chụp Cắt lớp vi tính)</Option>
            <Option value="ultrasound">Ultrasound (Siêu âm)</Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú bác sĩ chỉ định">
          <TextArea
            rows={4}
            placeholder="Nhập triệu chứng lâm sàng, vùng chụp chỉ định..."
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ScanForm;
