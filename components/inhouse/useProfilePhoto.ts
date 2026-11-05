"use client";

import { useEffect, useState } from "react";
import { profileKey } from "@/lib/inhouse";

export type Profile = {
  name: string;
  email: string;
  department: string;
  major: string;
  github: string;
  photo: string;
};

export const PROFILE_EVENT = "native-inhouse-profile-updated";

export function useProfilePhoto(email: string) {
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(profileKey(email));
      setPhoto(saved ? (JSON.parse(saved).photo ?? "") : "");
    } catch {
      setPhoto("");
    }
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ email: string; profile: Profile }>).detail;
      if (detail?.email === email) setPhoto(detail.profile.photo);
    };
    window.addEventListener(PROFILE_EVENT, onUpdate);
    return () => window.removeEventListener(PROFILE_EVENT, onUpdate);
  }, [email]);

  return photo;
}

// 정면 사진을 4:5(기본 640x800)로 잘라 data URL로 변환
export async function cropToPortrait(file: File, width = 640, quality = 0.86) {
  const height = Math.round((width * 5) / 4);
  const url = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("사진을 읽지 못했습니다."));
    });
    const ratio = img.width / img.height;
    const target = width / height;
    const sw = ratio > target ? img.height * target : img.width;
    const sh = ratio > target ? img.height : img.width / target;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas
      .getContext("2d")
      ?.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
