import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router";

export default function SignUpPage() {
  const clerkAppearance = {
    baseTheme: undefined,
    variables: {
      colorPrimary: "#030213",
      colorBackground: "#ffffff",
      colorInputBackground: "#ffffff",
      colorText: "#030213",
      colorTextSecondary: "#666666",
      colorBorder: "#030213",
      colorDangerText: "#d32f2f",
      borderRadius: "0.5rem",
      fontFamily: "'Century Gothic', 'CenturyGothic', 'Apple Gothic', system-ui",
      fontSize: "14px",
      fontSmooth: "antialiased"
    },
    elements: {
      // Main container and card styles
      rootBox: "rounded-2xl",
      card: "shadow-none border border-[#030213] p-8 md:p-10 rounded-2xl",
      
      // Headers
      headerTitle: "text-2xl font-bold text-[#030213] tracking-tight",
      headerSubtitle: "text-sm text-gray-600",
      header: "pb-6 border-b border-[#e0e0e0]",
      
      // Form elements
      form: "space-y-4",
      formFieldInput: "border-2 border-[#030213] px-4 py-3 rounded-lg focus:outline-none focus:ring-0 focus:border-[#030213] font-medium",
      formFieldInputShowPasswordButton: "text-[#030213]",
      input: "border-2 border-[#030213] px-4 py-3 rounded-lg focus:outline-none focus:ring-0 focus:border-[#030213] font-medium",
      
      // Buttons
      formButtonPrimary: "bg-[#030213] text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors w-full",
      button: "text-[#030213] font-semibold",
      buttonBaseButton: "rounded-lg border-2 border-[#030213] text-[#030213] font-semibold hover:bg-[#f5f5f5] transition-colors",
      
      // Social buttons
      socialButtonsBlockButton: "border-2 border-[#030213] text-[#030213] font-semibold hover:bg-[#030213] hover:text-white transition-colors rounded-lg",
      socialButtonsBlockButtonText: "font-semibold",
      
      // Dividers and text
      dividerRow: "before:bg-[#030213] after:bg-[#030213]",
      dividerText: "text-gray-600 font-medium",
      
      // Links
      formResendCodeLink: "text-[#030213] font-semibold hover:underline",
      anchor: "text-[#030213] font-semibold hover:underline",
      
      // Footer
      footer: "hidden",
      footerActionLink: "text-[#030213]",
      footerPagesLink: "text-[#030213]",
      
      // Tab styling
      tabButton: "text-sm font-semibold text-gray-600 border-b-2 border-transparent pb-2 hover:border-[#030213] transition-colors",
      tabButtonActive: "text-[#030213] border-b-2 border-[#030213]",
      
      // Alert and error messages
      alertBox: "rounded-lg border border-red-300 bg-red-50",
      alertText: "text-red-700 font-medium"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="max-w-md w-full">
        
        {/* Clerk SignUp Component */}
        <SignUp 
          appearance={clerkAppearance}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
        
        {/* Custom Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-[#030213] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
