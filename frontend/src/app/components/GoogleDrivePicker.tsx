import { useState } from 'react';
import { Cloud, Plus, AlertCircle } from 'lucide-react';
import { convertGoogleDriveLink } from '../../lib/googleDriveUtils';

interface GoogleDrivePickerProps {
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export const GoogleDrivePicker = ({ onSelect, multiple = true, disabled = false }: GoogleDrivePickerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const handlePasteGoogleDriveUrl = () => {
    if (!inputUrl.trim()) {
      setError('Please enter a Google Drive link');
      return;
    }

    try {
      // Convert the Google Drive URL to direct view URL
      const directUrl = convertGoogleDriveLink(inputUrl);
      
      if (!directUrl.includes('drive.google.com')) {
        setError('Please enter a valid Google Drive link');
        return;
      }

      setSelectedUrl(directUrl);
      setError(null);

      // If single mode, immediately call onSelect
      if (!multiple) {
        onSelect([directUrl]);
        setInputUrl('');
        setSelectedUrl(null);
      }
    } catch (err) {
      setError('Failed to process Google Drive link');
    }
  };

  const handleAddUrl = () => {
    if (selectedUrl) {
      onSelect([selectedUrl]);
      setInputUrl('');
      setSelectedUrl(null);
    }
  };

  const handleUseGooglePicker = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if Google API is available
      if (!(window as any).gapi) {
        // Fallback: Show instructions for manual URL input
        setError('Google Picker API not loaded. Please paste your Google Drive image link instead.');
        setLoading(false);
        return;
      }

      // For better UX, we'll use the URL paste method as primary
      // since it requires less setup than full OAuth
      setError('Paste your Google Drive image sharing link above (Ctrl+V)');
      setLoading(false);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="text-blue-600" size={20} />
        <h3 className="font-semibold text-blue-900">Google Drive Images</h3>
      </div>

      {/* Instructions */}
      <div className="text-sm text-blue-800 space-y-1">
        <p>✓ Right-click the image in Google Drive → Share</p>
        <p>✓ Get the sharing link and paste it below</p>
        <p>✓ Make sure "Viewer" access is enabled</p>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => {
            setInputUrl(e.target.value);
            setError(null);
          }}
          onPaste={() => setTimeout(handlePasteGoogleDriveUrl, 0)}
          placeholder="Paste Google Drive sharing link here..."
          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          disabled={disabled || loading}
        />
        
        {/* Preview if URL added */}
        {selectedUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 border-2 border-blue-400">
            <img 
              src={selectedUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onError={() => setError('Failed to load image. Check the sharing link.')}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePasteGoogleDriveUrl}
            disabled={disabled || loading || !inputUrl.trim()}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            Convert Link
          </button>
          {selectedUrl && (
            <button
              onClick={handleAddUrl}
              disabled={disabled || loading}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-1"
            >
              <Plus size={16} />
              Add Image
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-300 rounded-lg p-2 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Box */}
      <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
        <strong>Tip:</strong> Google Drive images load directly from their servers, so no separate hosting needed!
      </div>
    </div>
  );
};
