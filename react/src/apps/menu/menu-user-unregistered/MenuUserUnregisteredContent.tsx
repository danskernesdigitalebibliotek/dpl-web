import React from "react";
import { useQueryClient } from "react-query";
import { useUrls } from "../../../core/utils/url";
import { useText } from "../../../core/utils/text";
import { Button } from "../../../components/Buttons/Button";
import { performLogout } from "../../../core/utils/helpers/logout";

const MenuUserUnregisteredContent = () => {
  const t = useText();
  const u = useUrls();
  const logoutUrl = u("logoutUrl");
  const queryClient = useQueryClient();

  const handleOnClick = () => performLogout(logoutUrl, queryClient);

  return (
    <div className="modal-login modal-login--anonymous">
      <Button
        label={t("menuLogOutText")}
        buttonType="none"
        size="large"
        variant="filled"
        collapsible={false}
        onClick={handleOnClick}
      />
    </div>
  );
};

export default MenuUserUnregisteredContent;
