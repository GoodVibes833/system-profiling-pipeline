"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import dynamic from "next/dynamic";

const InviteModal = dynamic(() => import("@/components/InviteModal"), { ssr: false });

interface InviteButtonProps {
  placeId: string;
  placeName: string;
}

export default function InviteButton({ placeId, placeName }: InviteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
      >
        <UserPlus size={16} />
        친구 초대
      </button>
      {open && (
        <InviteModal
          placeId={placeId}
          placeName={placeName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
