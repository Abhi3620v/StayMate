import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useRoommate } from '@/context/RoommateContext';
import { AlertTriangle } from 'lucide-react';

export const ReportModal = ({ isOpen, onClose, roommateId, roommateName }) => {
  const { submitReport } = useRoommate();
  const [reason, setReason] = useState('Spam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitReport(roommateId, reason, description);
      onClose();
      setDescription('');
      setReason('Spam');
    } catch (err) {
      // toast runs in context
    } finally {
      setLoading(false);
    }
  };

  const reasonOptions = [
    { label: 'Spam', value: 'Spam' },
    { label: 'Fake Profile', value: 'Fake Profile' },
    { label: 'Harassment', value: 'Harassment' },
    { label: 'Inappropriate Information', value: 'Inappropriate Information' },
    { label: 'Duplicate Profile', value: 'Duplicate Profile' },
    { label: 'Other Reason', value: 'Other' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Roommate Profile" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-error-50 dark:bg-error-950/20 border border-error-100 dark:border-error-900/40 rounded-xl text-error-800 dark:text-error-300 font-semibold flex items-start space-x-2 leading-relaxed">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>
            You are reporting <strong>{roommateName}</strong>. Reports will be audited by administrators for platform safety violations.
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="font-extrabold text-secondary-500 uppercase tracking-wide">
            Reason for reporting
          </label>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={reasonOptions}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-extrabold text-secondary-500 uppercase tracking-wide">
            Detailed Description
          </label>
          <Textarea
            placeholder="Please provide details about links, messages, or activities violating rules..."
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportModal;
