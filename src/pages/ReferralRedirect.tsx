import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const ReferralRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      localStorage.setItem("vaultvibe_referral_code", code.toLowerCase());
      sessionStorage.setItem("vaultvibe_referral_signup", "true");
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
        <meta
          property="og:url"
          content={`https://vaultvibe.xyz/r/${code || ""}`}
        />
        <meta property="og:image" content="https://vaultvibe.xyz/referral-og.svg" />
        <meta property="og:image:alt" content="Free 1 month Vault Vibe Pro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vault Vibe Invite - Free 1 Month Pro" />
        <meta
          name="twitter:description"
          content="Join Vault Vibe with an invite and unlock 1 month of Pro for free."
        />
        <meta name="twitter:image" content="https://vaultvibe.xyz/referral-og.svg" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Preparing your invite...</div>
      </div>
    </>
  );
};

export default ReferralRedirect;
