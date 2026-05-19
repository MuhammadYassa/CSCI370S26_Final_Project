import { humanizeEnum } from '../lib/format';

const STATUS_CLASS_NAMES = {
  INTAKE_SUBMITTED: 'status-pill status-sky',
  MISSING_FORM_INFORMATION: 'status-pill status-amber',
  READY_FOR_GENERATION: 'status-pill status-mint',
  FORM_READY: 'status-pill status-mint',
  LANDLORD_RESPONSE_SUBMITTED: 'status-pill status-indigo',
  ARBITRATION_COMPLETE: 'status-pill status-rose',
  ARBITRATION_NOT_READY: 'status-pill status-amber',
  UNSUPPORTED_FORM_TYPE: 'status-pill status-slate'
};

function StatusPill({ status }) {
  return (
    <span className={STATUS_CLASS_NAMES[status] || 'status-pill status-slate'}>
      {humanizeEnum(status)}
    </span>
  );
}

export default StatusPill;
