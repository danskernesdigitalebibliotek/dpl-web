"use client";

import React from "react";

import Icon from "@/app/components/shared/icon/Icon";
import { useThemeStore } from "@/app/store/theme.store";

function DarkModeToggle() {
  const { toggleTheme } = useThemeStore();

  return (
    <button onClick={toggleTheme}>
      <Icon name="dark-mode-toggle" />
    </button>
  );
}

export default DarkModeToggle;
