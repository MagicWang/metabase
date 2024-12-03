import { DatePicker, Form, Radio, Switch } from "antd";
const { RangePicker } = DatePicker;
import { useCallback, useMemo } from "react";
import { jt, t } from "ttag";
import _ from "underscore";

import { useDocsUrl, useSetting } from "metabase/common/hooks";
import ExternalLink from "metabase/core/components/ExternalLink";
import Link from "metabase/core/components/Link";
import CS from "metabase/css/core/index.css";
import { useSelector } from "metabase/lib/redux";
import { getUserIsAdmin } from "metabase/selectors/user";
import { Box, Button, Group, Icon, Stack, Text } from "metabase/ui";
import type {
  Dashboard,
  VirtualDashboardCard,
  VisualizationSettings,
} from "metabase-types/api";

import {
  CustomBtnsWrapper,
  IFrameEditWrapper,
  IFrameWrapper,
  InteractiveText,
  StyledInput,
} from "./IFrameViz.styled";
import { settings } from "./IFrameVizSettings";
import { getAllowedIframeAttributes, isAllowedIframeUrl } from "./utils";

export interface IFrameVizProps {
  dashcard: VirtualDashboardCard;
  dashboard: Dashboard;
  isEditing: boolean;
  isPreviewing: boolean;
  onUpdateVisualizationSettings: (newSettings: VisualizationSettings) => void;
  settings: VisualizationSettings;
  isEditingParameter?: boolean;
  width: number;
  height: number;
  gridSize: {
    width: number;
    height: number;
  };
  onTogglePreviewing: () => void;
}

export function IFrameViz({
  dashcard,
  isEditing,
  onUpdateVisualizationSettings,
  settings,
  isEditingParameter,
  width,
  height,
  isPreviewing,
  onTogglePreviewing,
}: IFrameVizProps) {
  const { iframe: iframeOrUrl } = settings;
  const isNew = !!dashcard?.justAdded;

  const allowedHosts = useSetting("allowed-iframe-hosts");
  const allowedIframeAttributes = useMemo(
    () => getAllowedIframeAttributes(iframeOrUrl),
    [iframeOrUrl],
  );
  const regexpArr = /src="(\S*)"/.exec(iframeOrUrl || "");
  let iframeUrl = regexpArr?.length ? regexpArr[1] : "";
  const handleIFrameChange = useCallback(
    (newIFrame: string) => {
      iframeUrl = newIFrame;
      onUpdateVisualizationSettings({
        iframe: `<iframe src="${newIFrame}" />`,
      });
    },
    [onUpdateVisualizationSettings],
  );
  const handleFormChange = useCallback(
    (allValues: any) => {
      onUpdateVisualizationSettings(allValues);
    },
    [onUpdateVisualizationSettings],
  );
  const [form] = Form.useForm();
  if (isEditing && !isEditingParameter && !isPreviewing) {
    return (
      <IFrameEditWrapper>
        <Stack h="100%" spacing="sm">
          <Group align="center" noWrap>
            <Text fw="bold" truncate>
              {t`Paste your snippet here`}
            </Text>{" "}
            <Box ml="auto">
              <Button
                compact
                variant="filled"
                style={{ pointerEvents: "all" }}
                onClick={onTogglePreviewing}
                onMouseDown={e => e.stopPropagation()}
              >{t`Done`}</Button>
            </Box>
          </Group>
          <Box h="100%">
            <StyledInput
              data-testid="iframe-card-input"
              autoFocus={isNew}
              size="100%"
              styles={{
                wrapper: {
                  height: "100%",
                },
              }}
              h="50%"
              value={iframeUrl}
              placeholder={`https://example.com`}
              onChange={e => handleIFrameChange(e.target.value)}
              onMouseDown={e => e.stopPropagation()}
              style={{ pointerEvents: "all" }}
            />
            <Form
              style={{ marginTop: "8px" }}
              form={form}
              layout="inline"
              initialValues={dashcard.visualization_settings}
              onValuesChange={(_, allValues) => {
                handleFormChange(allValues);
              }}
            >
              <Form.Item
                name="hiddenToolbar"
                label={t`Hidden Toolbar`}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="hiddenFilter"
                label={t`Hidden Filter`}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="customDateRange"
                label={t`Custom Date Range`}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="customTimeGroup"
                label={t`Custom Time Group`}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Form>
          </Box>
        </Stack>
      </IFrameEditWrapper>
    );
  }
  const src = allowedIframeAttributes?.src;

  const hasAllowedIFrameUrl = src && isAllowedIframeUrl(src, allowedHosts);
  const hasForbiddenIFrameUrl = src && !isAllowedIframeUrl(src, allowedHosts);
  const hiddenToolbar = src && dashcard.visualization_settings.hiddenToolbar;
  const hiddenFilter = src && dashcard.visualization_settings.hiddenFilter;
  const hasCustomDateRange =
    src && dashcard.visualization_settings.customDateRange;
  const hasCustomTimeGroup =
    src && dashcard.visualization_settings.customTimeGroup;

  const url = new URL(src || "");
  if (hiddenToolbar) {
    url.searchParams.set("hiddenToolbar", "true");
  } else {
    url.searchParams.delete("hiddenToolbar");
  }
  if (hiddenFilter) {
    url.searchParams.set("hiddenFilter", "true");
  } else {
    url.searchParams.delete("hiddenFilter");
  }
  const token = (window as any).Metabase.store.getState().app.tempStorage.token;
  url.searchParams.set("token", token || "");
  const iframeUrl1 = new URL(iframeUrl || "");
  const onDateChange = (dates: any, dateStrings: any) => {
    if (dates) {
      iframeUrl1.searchParams.set("date_range", dateStrings.join("~"));
    } else {
      iframeUrl1.searchParams.delete("date_range");
    }
    handleIFrameChange(iframeUrl1.href);
  };
  const onRadioChange = (e: any) => {
    url.searchParams.set("time_grouping", e.target.value);
    // iframeUrl1.searchParams.set("time_grouping", e.target.value);
    handleIFrameChange(iframeUrl);
  };
  const renderError = () => {
    if (hasForbiddenIFrameUrl && isEditing) {
      return <ForbiddenDomainError url={src} />;
    }
    return <GenericError />;
  };
  return (
    <IFrameWrapper data-testid="iframe-card" fade={isEditingParameter}>
      {hasAllowedIFrameUrl ? (
        <iframe
          data-testid="iframe-visualization"
          width={width}
          height={height}
          frameBorder={0}
          sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
          referrerPolicy="strict-origin-when-cross-origin"
          {...allowedIframeAttributes}
          src={url.href}
        />
      ) : (
        renderError()
      )}
      <CustomBtnsWrapper>
        {hasCustomDateRange ? <RangePicker onChange={onDateChange} /> : null}
        {hasCustomTimeGroup ? (
          <Radio.Group
            defaultValue="month"
            optionType="button"
            buttonStyle="solid"
            onChange={onRadioChange}
          >
            <Radio.Button value="month">{t`month`}</Radio.Button>
            <Radio.Button value="quarter">{t`quarter`}</Radio.Button>
            <Radio.Button value="year">{t`year`}</Radio.Button>
          </Radio.Group>
        ) : null}
      </CustomBtnsWrapper>
    </IFrameWrapper>
  );
}

function ForbiddenDomainError({ url }: { url: string }) {
  const isAdmin = useSelector(getUserIsAdmin);
  const { url: docsUrl, showMetabaseLinks } = useDocsUrl(
    "configuring-metabase/settings",
    { anchor: "allowed-domains-for-iframes-in-dashboards" },
  );

  const domain = useMemo(() => {
    try {
      const { hostname } = new URL(url);
      return hostname;
    } catch {
      return url;
    }
  }, [url]);

  const renderMessage = () => {
    if (isAdmin) {
      return jt`If you’re sure you trust this domain, you can add it to your ${(<Link key="link" className={CS.link} to="/admin/settings/general#allowed-iframe-hosts" target="_blank">{t`allowed domains list`}</Link>)} in admin settings.`;
    }
    return showMetabaseLinks
      ? jt`If you’re sure you trust this domain, you can ask an admin to add it to the ${(<ExternalLink key="link" className={CS.link} href={docsUrl}>{t`allowed domains list`}</ExternalLink>)}.`
      : t`If you’re sure you trust this domain, you can ask an admin to add it to the allowed domains list.`;
  };

  return (
    <Box p={12} w="100%" style={{ textAlign: "center" }}>
      <Icon name="lock" color="var(--mb-color-text-dark)" mb="s" />
      <Text color="text-dark">
        {jt`${(
          <Text key="domain" fw="bold" display="inline">
            {domain}
          </Text>
        )} can not be embedded in iframe cards.`}
      </Text>
      <InteractiveText color="text-dark" px="lg" mt="md">
        {renderMessage()}
      </InteractiveText>
    </Box>
  );
}

function GenericError() {
  return (
    <Box p={12} w="100%" style={{ textAlign: "center" }}>
      <Icon name="lock" color="var(--mb-color-text-dark)" mb="s" />
      <Text color="text-dark">
        {t`There was a problem rendering this content.`}
      </Text>
    </Box>
  );
}

Object.assign(IFrameViz, settings);
