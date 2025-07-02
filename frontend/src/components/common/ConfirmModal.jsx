import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;