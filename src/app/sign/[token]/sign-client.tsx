'use client';

import { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";

type Props = {
  recipientId: string;
  envelopeId: string;
  pdfUrl: string;
  token: string;
  recipientEmail: string;
};

export default function SignClient({
  pdfUrl,
  token,
  recipientEmail,
}: Props) {
  const padRef = useRef<SignaturePad>(null);
  const [placing, setPlacing] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    const dataUrl = padRef.current?.getTrimmedCanvas().toDataURL("image/png");
    if (!dataUrl) {
      alert("Draw a signature first");
      return;
    }
    setPlacing(true);
    const res = await fetch("/api/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, dataUrl }),
    });
    setPlacing(false);
    if (res.ok) {
      setSigned(true);
      setError(null);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to sign");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Sign Document</h1>
          <p className="text-indigo-100/80 text-sm">
            {recipientEmail} — draw your signature, then place it to complete.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/30 overflow-hidden border border-white/60">
          <iframe src={pdfUrl} className="w-full h-[70vh] border-0" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/30 border border-white/60 p-6 text-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Signature</div>
              <p className="text-sm text-slate-500">
                Draw your signature inside the box, then place it on the document.
              </p>
            </div>
            <button
              type="button"
              onClick={() => padRef.current?.clear()}
              className="text-sm text-indigo-700 hover:text-indigo-900 font-medium"
            >
              Clear
            </button>
          </div>
          <SignaturePad
            ref={padRef}
            penColor="#0f172a"
            canvasProps={{
              className:
                "border border-dashed border-slate-300 rounded-xl w-full h-44 bg-slate-50 shadow-inner",
            }}
          />
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {signed && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Signature placed. You can close this window.
            </div>
          )}
          <button
            onClick={handleSign}
            disabled={placing || signed}
            className="w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60 shadow-lg shadow-indigo-500/30"
          >
            {placing ? "Placing..." : signed ? "Signed" : "Place Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}
