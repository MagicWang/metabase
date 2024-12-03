import { t } from "ttag";

import { useSelector } from "metabase/lib/redux";
import { getUserIsAdmin } from "metabase/selectors/user";
import { Center, Icon, Menu, Title } from "metabase/ui";

export function ShareBoardMenuItem({ onClick }: { onClick: () => void }) {
  const isAdmin = useSelector(getUserIsAdmin);

  if (!isAdmin) {
    return null;
  }

  return (
    <Menu.Item
      data-testid="embed-menu-embed-modal-item"
      py="sm"
      icon={
        <Center mr="xs">
          <Icon name="webhook" />
        </Center>
      }
      onClick={onClick}
    >
      {<Title order={4}>{t`Share Board`}</Title>}
    </Menu.Item>
  );
}
