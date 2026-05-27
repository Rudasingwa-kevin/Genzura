import { useState } from 'react';
import { Mail, Send, CheckCircle2, Loader2, Settings } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/client';

export default function EmailTestPanel() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('subscription_activated');
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await apiClient.post('/test/email/connection');
      const data = response.data;
      setConnectionStatus(data);

      if (data.success) {
        toast.success('Email service connected successfully!', {
          icon: '✅',
          duration: 4000
        });
      } else {
        toast.error('Email service connection failed!', {
          icon: '❌',
          duration: 4000
        });
      }
    } catch (error: any) {
      toast.error('Failed to test connection', {
        icon: '❌'
      });
      setConnectionStatus({
        success: false,
        message: error.message
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getConfig = async () => {
    try {
      const response = await apiClient.get('/test/email/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Failed to get config:', error);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await apiClient.post('/test/email/send', {
        to: testEmail,
        type: selectedTemplate
      });

      const data = response.data;

      if (data.success) {
        toast.success(data.message, {
          icon: '✅',
          duration: 4000
        });
      } else {
        toast.error(data.error || 'Failed to send email', {
          icon: '❌'
        });
      }
    } catch (error: any) {
      toast.error('Failed to send test email', {
        icon: '❌'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const sendAllTemplates = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsSendingAll(true);
    try {
      const response = await apiClient.post('/test/email/all-templates', {
        to: testEmail
      });

      const data = response.data;

      if (data.success) {
        toast.success(`Sent ${data.summary.success}/${data.summary.total} templates successfully!`, {
          icon: '✅',
          duration: 5000
        });
      } else {
        toast.error(`Sent ${data.summary.success}/${data.summary.total} templates`, {
          icon: '⚠️'
        });
      }
    } catch (error: any) {
      toast.error('Failed to send test emails', {
        icon: '❌'
      });
    } finally {
      setIsSendingAll(false);
    }
  };

  return (
    <AdminLayout title="Email Service Testing">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Email Service Testing</h1>
          <p className="text-text-muted mt-1">Test and verify email configuration before deployment</p>
        </div>

        {/* Configuration Status */}
        <div className="bg-white rounded-2xl border border-border-base p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-blue flex items-center justify-center">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-dark">Configuration Status</h3>
                <p className="text-xs text-text-muted">Current email service configuration</p>
              </div>
            </div>
            <button
              onClick={getConfig}
              className="px-4 py-2 rounded-xl bg-page-bg text-brand-dark font-bold text-sm hover:bg-brand-light transition-all"
            >
              Refresh Config
            </button>
          </div>

          {config && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-page-bg">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">SMTP Configured</p>
                <p className={`text-lg font-bold ${config.configured ? 'text-emerald-600' : 'text-red-600'}`}>
                  {config.configured ? '✅ Yes' : '❌ No'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-page-bg">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Sender Email</p>
                <p className="text-sm font-bold text-brand-dark">{config.config.senderEmail}</p>
              </div>
              <div className="p-4 rounded-xl bg-page-bg">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Host</p>
                <p className="text-sm font-bold text-brand-dark">{config.config.host}:{config.config.port}</p>
              </div>
              <div className="p-4 rounded-xl bg-page-bg">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Status</p>
                <p className="text-sm font-bold text-brand-blue">{config.status}</p>
              </div>
            </div>
          )}
        </div>

        {/* Connection Test */}
        <div className="bg-white rounded-2xl border border-border-base p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-dark">Connection Test</h3>
              <p className="text-xs text-text-muted">Verify SMTP connection to Brevo</p>
            </div>
          </div>

          <button
            onClick={testConnection}
            disabled={isTestingConnection}
            className="w-full px-6 py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Testing Connection...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Test SMTP Connection
              </>
            )}
          </button>

          {connectionStatus && (
            <div className={`mt-4 p-4 rounded-xl ${connectionStatus.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-bold ${connectionStatus.success ? 'text-emerald-600' : 'text-red-600'}`}>
                {connectionStatus.message}
              </p>
            </div>
          )}
        </div>

        {/* Send Test Email */}
        <div className="bg-white rounded-2xl border border-border-base p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <Send size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-dark">Send Test Email</h3>
              <p className="text-xs text-text-muted">Test individual email templates</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-brand-dark uppercase block mb-2">Test Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border-base focus:border-brand-blue outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-dark uppercase block mb-2">Email Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-base focus:border-brand-blue outline-none font-bold"
              >
                <option value="subscription_activated">Subscription Activated</option>
                <option value="subscription_extended">Subscription Extended</option>
                <option value="subscription_cancelled">Subscription Cancelled</option>
                <option value="welcome">Welcome Email</option>
                <option value="invitation">Invitation Email</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={sendTestEmail}
                disabled={isSendingEmail}
                className="flex-1 px-6 py-4 rounded-xl bg-brand-blue text-white font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Test Email
                  </>
                )}
              </button>

              <button
                onClick={sendAllTemplates}
                disabled={isSendingAll}
                className="flex-1 px-6 py-4 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSendingAll ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending All...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Send All Templates
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h4 className="text-sm font-bold text-amber-900 mb-3">📋 Testing Instructions</h4>
          <ol className="space-y-2 text-sm text-amber-800">
            <li><strong>1.</strong> First, click "Test SMTP Connection" to verify the connection to Brevo</li>
            <li><strong>2.</strong> Enter your email address in the test field</li>
            <li><strong>3.</strong> Select a template and click "Send Test Email"</li>
            <li><strong>4.</strong> Check your inbox (and spam folder) for the test email</li>
            <li><strong>5.</strong> Or click "Send All Templates" to test all 5 email templates at once</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
}
