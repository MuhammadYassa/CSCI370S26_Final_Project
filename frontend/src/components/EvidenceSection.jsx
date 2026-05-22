import { useEffect, useState } from 'react';
import { ApiError, api } from '../lib/api';
import { formatDateTime, humanizeEnum } from '../lib/format';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function EvidenceSection({
  caseId,
  canUpload,
  title = 'Evidence',
  subtitle = 'Upload JPEG, PNG, or WEBP files up to 5 MB each.',
  onEvidenceChanged
}) {
  const [evidence, setEvidence] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadEvidence() {
      try {
        const result = await api.getEvidence(caseId);

        if (!cancelled) {
          setEvidence(result.evidence || []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadEvidence();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  async function refreshEvidence() {
    const result = await api.getEvidence(caseId);
    setEvidence(result.evidence || []);
    onEvidenceChanged?.();
  }

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const invalidFile = files.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES
    );

    if (invalidFile) {
      setErrorMessage(
        'Use only JPEG, PNG, or WEBP images that are 5 MB or smaller.'
      );
      event.target.value = '';
      return;
    }

    setErrorMessage('');
    setIsUploading(true);

    try {
      await api.uploadEvidence(caseId, files);
      await refreshEvidence();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <section className="card section-stack">
      <div className="split-row">
        <div>
          <h3>{title}</h3>
          <p className="section-copy">{subtitle}</p>
        </div>

        {canUpload ? (
          <label className="button button-secondary upload-button">
            {isUploading ? 'Uploading...' : 'Add evidence'}
            <input
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              disabled={isUploading}
              multiple
              onChange={handleUpload}
              type="file"
            />
          </label>
        ) : null}
      </div>

      {errorMessage ? <div className="alert alert-warning">{errorMessage}</div> : null}

      {isLoading ? (
        <p className="empty-copy">Loading evidence...</p>
      ) : evidence.length === 0 ? (
        <p className="empty-copy">No evidence has been uploaded yet.</p>
      ) : (
        <div className="evidence-grid">
          {evidence.map((item) => (
            <article
              key={item.evidenceId}
              className="evidence-card"
            >
              <div className="evidence-meta">
                <span className="mini-pill">{humanizeEnum(item.uploadedByRole)}</span>
                <strong>{item.originalFilename}</strong>
                <span>{(item.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                <span>{formatDateTime(item.createdAt)}</span>
              </div>

              <button
                className="button button-ghost"
                onClick={async () => {
                  try {
                    await api.downloadEvidence(item.fileUrl, item.originalFilename);
                  } catch (error) {
                    setErrorMessage(
                      error instanceof ApiError ? error.message : 'Download failed.'
                    );
                  }
                }}
                type="button"
              >
                Download
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default EvidenceSection;
