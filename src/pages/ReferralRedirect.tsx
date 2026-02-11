import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const ReferralRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const baseUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://vaultvibe.xyz";
  }, []);

  useEffect(() => {
    if (code) {
      const normalized = code.toLowerCase();
      localStorage.setItem("vaultvibe_referral_code", normalized);
      sessionStorage.setItem("vaultvibe_referral_signup", "true");
      navigate(`/?ref=${encodeURIComponent(normalized)}`, { replace: true });
      return;
    }
    navigate("/", { replace: true });
  }, [code, navigate]);

  return (
    <>
      <Helmet>
        <title>Vault Vibe Invite - Free 1 Month Pro</title>
        <meta
          name="description"
          content="Join Vault Vibe with an invite and unlock 1 month of Pro for free."
        />
        <meta property="og:title" content="Vault Vibe Invite - Free 1 Month Pro" />
        <meta
          property="og:description"
          content="Join Vault Vibe with an invite and unlock 1 month of Pro for free."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/r/${code || ""}`} />
        <meta property="og:image" content={`${baseUrl}/referral-og.svg`} />
        <meta property="og:image:alt" content="Free 1 month Vault Vibe Pro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vault Vibe Invite - Free 1 Month Pro" />
        <meta
          name="twitter:description"
          content="Join Vault Vibe with an invite and unlock 1 month of Pro for free."
        />
        <meta name="twitter:image" content={`${baseUrl}/referral-og.svg`} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Preparing your invite...</div>
      </div>
    </>
  );
};

export default ReferralRedirect;
