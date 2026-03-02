import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
    fbAsyncInit?: () => void;
    FB?: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, config: any) => void;
      AppEvents?: {
        logEvent?: (event: string) => void;
      };
    };
  }
}

export function GoogleLoginButton({ onSuccess, disabled = false }) {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: onSuccess,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            width: '100%',
          });
        }
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [onSuccess]);

  return (
    <div ref={googleButtonRef} className="w-full flex justify-center"></div>
  );
}

export function FacebookLoginButton({ onSuccess, disabled = false }) {
  const facebookButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = () => {
      if (window.FB) {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID,
          xfbml: true,
          version: 'v18.0',
        });
      }
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0&appId=' + 
      import.meta.env.VITE_FACEBOOK_APP_ID + '&autoLogAppEvents=1';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleFacebookLogin = () => {
    if (window.FB) {
      window.FB.login((response) => {
        if (response.authResponse) {
          // Get user data
          window.FB.api('/me', { fields: 'id,name,email,picture' }, (userResponse) => {
            onSuccess({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID,
              ...userResponse,
            });
          });
        }
      }, { scope: 'public_profile,email' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleFacebookLogin}
      disabled={disabled}
      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      Continue with Facebook
    </button>
  );
}
