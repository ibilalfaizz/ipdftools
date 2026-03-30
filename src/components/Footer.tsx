import { Heart } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#00232d]/90 border-t border-[#d6ffd2]/15 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-[#d6ffd2] font-medium mb-2">
            © 2025 iPDFTOOLS. Built with{" "}
            <Heart className="inline h-4 w-4 text-[#d6ffd2] fill-[#d6ffd2]/30" /> by{" "}
            <a
              href="https://bilalfaiz.com/"
              className="text-[#d6ffd2] underline underline-offset-2 hover:text-[#d6ffd2]/90"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bilal Faiz
            </a>
            .
          </p>
          <p className="text-sm text-[#d6ffd2]/70">
            All processing is done securely in your browser. Your files are
            never stored on our servers.
          </p>
          <div className="mt-4 text-xs text-[#d6ffd2]/50">
            Professional PDF tools for everyone - Free, Fast, and Secure
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
