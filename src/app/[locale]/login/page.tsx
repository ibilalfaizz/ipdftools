import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LoginAuthClient from "@/components/LoginAuthClient";
import { LOCALE_CODES, isLocalePrefix, type LocaleCode } from "@/lib/urlPaths";

type Props = { params: { locale: string } };

const titles: Record<LocaleCode, string> = {
  en: "Log in or sign up — iPDFTOOLS",
  es: "Iniciar sesión o registrarse — iPDFTOOLS",
  fr: "Connexion ou inscription — iPDFTOOLS",
};

const descriptions: Record<LocaleCode, string> = {
  en: "Sign in with email and password or Google to sync your workflows.",
  es: "Inicia sesión con correo y contraseña o Google para sincronizar tus flujos.",
  fr: "Connectez-vous par e-mail, mot de passe ou Google pour synchroniser vos flux.",
};

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = typeof params?.locale === "string" ? params.locale.trim() : "";
  if (!isLocalePrefix(locale)) return {};
  const code = locale as LocaleCode;
  return {
    title: titles[code],
    description: descriptions[code],
  };
}

export default function LoginPage({ params }: Props) {
  const locale = typeof params?.locale === "string" ? params.locale.trim() : "";
  if (!isLocalePrefix(locale)) {
    notFound();
  }
  return <LoginAuthClient />;
}
