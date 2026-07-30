import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
} from 'antd';
import dayjs from 'dayjs';
import type { Patient, PatientDetail, CreatePatientRequest, UpdatePatientRequest } from '../../types/patient';
import { patientService } from '../../services/patientService';

const { TextArea } = Input;
const { Option } = Select;

interface PatientFormProps {
  open: boolean;
  /** Pass a patient to trigger Edit mode; undefined = Create mode. */
  editingPatient?: Patient | PatientDetail | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
  open,
  editingPatient,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const isEditMode = !!editingPatient;

  // Pre-fill form when editing
  useEffect(() => {
    if (open) {
      if (isEditMode && editingPatient) {
        form.setFieldsValue({
          full_name: editingPatient.full_name,
          gender: editingPatient.gender ?? undefined,
          phone: editingPatient.phone ?? undefined,
          date_of_birth: editingPatient.date_of_birth
            ? dayjs(editingPatient.date_of_birth)
            : undefined,
          address: (editingPatient as PatientDetail).address ?? undefined,
          medical_history: (editingPatient as PatientDetail).medical_history ?? undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingPatient, isEditMode, form]);

  const handleSubmit = async () => {
    let values: CreatePatientRequest | UpdatePatientRequest;
    try {
      values = await form.validateFields();
    } catch {
      return; // Ant Design shows field-level errors automatically
    }

    // Convert dayjs to YYYY-MM-DD string
    if ((values as { date_of_birth?: unknown }).date_of_birth) {
      const dob = (values as unknown as { date_of_birth: dayjs.Dayjs }).date_of_birth;
      (values as CreatePatientRequest).date_of_birth = dob.format('YYYY-MM-DD');
    }

    setLoading(true);
    try {
      if (isEditMode && editingPatient) {
        await patientService.update(editingPatient.id, values as UpdatePatientRequest);
        message.success('Cập nhật hồ sơ bệnh nhân thành công!');
      } else {
        await patientService.create(values as CreatePatientRequest);
        message.success('Tạo hồ sơ bệnh nhân thành công!');
      }
      onSuccess();
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Đã có lỗi xảy ra. Vui lòng thử lại.';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? 'Chỉnh sửa hồ sơ bệnh nhân' : 'Thêm bệnh nhân mới'}
      open={open}
      onCancel={onCancel}
      width={680}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {isEditMode ? 'Lưu thay đổi' : 'Tạo bệnh nhân'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" requiredMark>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="full_name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên bệnh nhân' }]}
            >
              <Input placeholder="Nguyễn Văn A" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="date_of_birth" label="Ngày sinh">
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày sinh"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current.isAfter(dayjs())}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="gender" label="Giới tính">
              <Select placeholder="Chọn giới tính" allowClear>
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^[0-9+\-\s]{7,20}$/,
                  message: 'Số điện thoại không hợp lệ',
                },
              ]}
            >
              <Input placeholder="0901 234 567" maxLength={20} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="address" label="Địa chỉ">
              <Input placeholder="Số nhà, Đường, Quận, Tỉnh/Thành phố" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="medical_history" label="Tiền sử bệnh án">
          <TextArea
            rows={4}
            placeholder="Ghi chú tiền sử bệnh, dị ứng thuốc, v.v."
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PatientForm;
