"use client";

import React from "react";

import Icon from "@/components/shared/icon/Icon";
import { useThemeStore } from "@/store/theme.store";

function DarkModeToggle() {
  const { toggleTheme } = useThemeStore();

  return (
    <button onClick={toggleTheme}>
      <Icon className="h-[40px]" name="dark-mode-toggle" />
    </button>
  );
}

export default DarkModeToggle;
