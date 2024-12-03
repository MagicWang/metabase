import { useCallback, useState } from "react";
import type { WithRouterProps } from "react-router";
import screenfull from "screenfull";

import {
  useDashboardUrlParams,
  useRefreshDashboard,
} from "metabase/dashboard/hooks";
import { useDashboardUrlQuery } from "metabase/dashboard/hooks/use-dashboard-url-query";
import { getDashboardComplete } from "metabase/dashboard/selectors";
import { SetTitle } from "metabase/hoc/Title";
import { useSelector } from "metabase/lib/redux";
import { getCanWhitelabel } from "metabase/selectors/whitelabel";

import { PublicOrEmbeddedDashboard } from "../PublicOrEmbeddedDashboard";
import { usePublicDashboardEndpoints } from "../WithPublicDashboardEndpoints";

export const PublicOrEmbeddedDashboardPage = (props: WithRouterProps) => {
  const { location, router } = props;
  const parameterQueryParams = props.location.query;

  const { dashboardId } = usePublicDashboardEndpoints(props);

  const { refreshDashboard } = useRefreshDashboard({
    dashboardId,
    parameterQueryParams,
  });

  useDashboardUrlQuery(router, location);

  const {
    background,
    bordered,
    hasNightModeToggle,
    downloadsEnabled,
    hideParameters,
    // isFullscreen,
    isNightMode,
    onNightModeChange,
    refreshPeriod,
    // onFullscreenChange,
    setRefreshElapsedHook,
    onRefreshPeriodChange,
    theme,
    titled,
    font,
    locale,
  } = useDashboardUrlParams({ location, onRefresh: refreshDashboard });

  const canWhitelabel = useSelector(getCanWhitelabel);

  const dashboard = useSelector(getDashboardComplete);

  const [isFullscreen, setIsFullscreen] = useState(false);
  screenfull.onchange(() => {
    setIsFullscreen(screenfull.isFullscreen);
  });
  const onFullscreenChange = useCallback(
    (
      nextIsFullscreen: boolean | null,
      openInBrowserFullscreen: boolean = true,
    ) => {
      if (nextIsFullscreen === isFullscreen) {
        return;
      }
      if (isFullscreen || (nextIsFullscreen && openInBrowserFullscreen)) {
        screenfull.toggle();
      }
      setIsFullscreen(nextIsFullscreen ?? false);
    },
    [isFullscreen],
  );
  return (
    <>
      <SetTitle title={dashboard?.name} />
      <PublicOrEmbeddedDashboard
        dashboardId={dashboardId}
        isFullscreen={isFullscreen}
        refreshPeriod={refreshPeriod}
        hideParameters={hideParameters}
        isNightMode={isNightMode}
        hasNightModeToggle={hasNightModeToggle}
        setRefreshElapsedHook={setRefreshElapsedHook}
        onNightModeChange={onNightModeChange}
        onFullscreenChange={onFullscreenChange}
        onRefreshPeriodChange={onRefreshPeriodChange}
        background={background}
        bordered={bordered}
        downloadsEnabled={downloadsEnabled}
        theme={theme}
        titled={titled}
        font={font}
        parameterQueryParams={parameterQueryParams}
        cardTitled={true}
        locale={canWhitelabel ? locale : undefined}
      />
    </>
  );
};
