import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
import * as turf from '@turf/turf';
import * as d3 from 'd3-ease';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import MapGL, {
  FlyToInterpolator,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  WebMercatorViewport,
} from 'react-map-gl';
import CancelIcon from '../../../../assets/images/icons/CancelIcon';
import ExploreIcon from '../../../../assets/images/icons/ExploreIcon';
import Switch from '../../../common/InputTypes/ToggleSwitch';
import LeftIcon from '../../../../assets/images/icons/LeftIcon';
import RightIcon from '../../../../assets/images/icons/RightIcon';
import PopupProject from './PopupProject';
import styles from '../styles/MapboxMap.module.scss';

interface mapProps {
  projects: any;
  project: any;
  showSingleProject: Boolean;
  mapboxToken: any;
  setShowProjects: Function;
}
export default function MapboxMap({
  projects,
  project,
  showSingleProject,
  mapboxToken,
  setShowProjects,
}: mapProps) {
  // eslint-disable-next-line no-undef
  let timer: NodeJS.Timeout;
  const router = useRouter();
  const mapRef = useRef(null);
  const parentRef = useRef(null);
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth <= 767;
  const [popupData, setPopupData] = useState({ show: false });
  const [open, setOpen] = React.useState(false);
  const [siteExists, setsiteExists] = React.useState(false);
  const defaultMapCenter = isMobile ? [22.54, 9.59] : [36.96, -28.5];
  const defaultZoom = isMobile ? 1 : 1.4;
  const [singleProjectLatLong, setSingleProjectLatLong] = React.useState([
    defaultMapCenter[0],
    defaultMapCenter[1],
  ]);
  const [geojson, setGeojson] = React.useState({});
  const [maxSites, setMaxSites] = React.useState();
  const [currentSite, setCurrentSite] = React.useState<null | Number>();

  const [mapState, setMapState] = useState({
    mapStyle: 'mapbox://styles/sagararl/ckdfyrsw80y3a1il9eqpecoc7',
  });

  const [viewport, setViewPort] = useState({
    width: Number('100%'),
    height: Number('100%'),
    latitude: defaultMapCenter[0],
    longitude: defaultMapCenter[1],
    zoom: defaultZoom,
  });

  const [exploreExpanded, setExploreExpanded] = React.useState(false);

  const [exploreForests, setExploreForests] = React.useState(false);

  const [explorePotential, setExplorePotential] = React.useState(false);

  const [exploreDeforestation, setExploreDeforestation] = React.useState(false);

  const [explorePlanted, setExplorePlanted] = React.useState(false);

  const [exploreProjects, setExploreProjects] = React.useState(true);

  const handleExploreForestsChange = (event) => {
    setExploreForests(event.target.checked);
  };

  const handleExplorePotentialChange = (event) => {
    setExplorePotential(event.target.checked);
  };
  const handleExploreDeforestationChange = (event) => {
    setExploreDeforestation(event.target.checked);
  };
  const handleExplorePlantedChange = (event) => {
    setExplorePlanted(event.target.checked);
  };
  const handleExploreProjectsChange = (event) => {
    setExploreProjects(event.target.checked);
    setShowProjects(event.target.checked);
    if (!event.target.checked) {
      const newViewport = {
        ...viewport,
        latitude: 36.96,
        longitude: 0,
        zoom: 1.4,
        transitionDuration: 2400,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: d3.easeCubic,
      };
      setViewPort(newViewport);
    } else {
      const newViewport = {
        ...viewport,
        latitude: defaultMapCenter[0],
        longitude: defaultMapCenter[1],
        zoom: 1.4,
        transitionDuration: 2400,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: d3.easeCubic,
      };
      setViewPort(newViewport);
    }
  };

  React.useEffect(() => {
    if (showSingleProject && project !== null) {
      setSingleProjectLatLong([
        project.coordinates.lat,
        project.coordinates.lon,
      ]);

      const newGeojson = {
        type: 'FeatureCollection',
        features: project.sites,
      };

      setGeojson({
        type: 'FeatureCollection',
        features: project.sites,
      });

      if (
        typeof newGeojson.features !== 'undefined' &&
        newGeojson.features.length > 0
      ) {
        if (newGeojson.features[0].geometry !== null) {
          setsiteExists(true);
          setCurrentSite(0);
          setMaxSites(newGeojson.features.length);
        } else {
          setsiteExists(false);
        }
      } else {
        setsiteExists(false);
      }
    } else if (project !== null) {
      const newMapState = {
        mapStyle: 'mapbox://styles/sagararl/ckdfyrsw80y3a1il9eqpecoc7',
      };
      const newViewport = {
        ...viewport,
        latitude: defaultMapCenter[0],
        longitude: defaultMapCenter[1],
        zoom: 1.4,
        transitionDuration: 2400,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: d3.easeCubic,
      };
      setMapState(newMapState);
      setViewPort(newViewport);
    }
  }, [project, showSingleProject]);

  React.useEffect(() => {
    if (showSingleProject) {
      if (siteExists) {
        let bbox = turf.bbox(geojson.features[currentSite]);
        bbox = [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ];
        const { longitude, latitude, zoom } = new WebMercatorViewport(
          viewport
        ).fitBounds(bbox, {
          padding: {
            top: 50,
            bottom: isMobile ? 120 : 50,
            left: isMobile ? 50 : 400,
            right: isMobile ? 50 : 100,
          },
        });
        const newMapState = {
          mapStyle: 'mapbox://styles/mapbox/satellite-v9',
        };
        const newViewport = {
          ...viewport,
          longitude,
          latitude,
          zoom,
          transitionDuration: 4000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: d3.easeCubic,
        };
        setViewPort(newViewport);
        setMapState(newMapState);
      } else {
        const newMapState = {
          mapStyle: 'mapbox://styles/sagararl/ckdfyrsw80y3a1il9eqpecoc7',
        };
        const newViewport = {
          ...viewport,
          longitude: singleProjectLatLong[1],
          latitude: singleProjectLatLong[0],
          zoom: 5,
          transitionDuration: 4000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: d3.easeCubic,
        };

        setViewPort(newViewport);
        setMapState(newMapState);
      }
    }
  }, [project, siteExists, geojson]);

  React.useEffect(() => {
    if (showSingleProject && siteExists) {
      if (currentSite < maxSites) {
        let bbox = turf.bbox(geojson.features[currentSite]);
        bbox = [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ];
        const { longitude, latitude, zoom } = new WebMercatorViewport(
          viewport
        ).fitBounds(bbox, {
          padding: {
            top: 50,
            bottom: isMobile ? 120 : 50,
            left: isMobile ? 50 : 400,
            right: isMobile ? 50 : 100,
          },
        });
        const newMapState = {
          mapStyle: 'mapbox://styles/mapbox/satellite-v9',
        };
        const newViewport = {
          ...viewport,
          longitude,
          latitude,
          zoom,
          transitionDuration: 4000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: d3.easeCubic,
        };
        setViewPort(newViewport);
        setMapState(newMapState);
      }
    }
  }, [currentSite]);

  const _onStateChange = (state: any) => setMapState({ ...state });

  const _onViewportChange = (view: any) => setViewPort({ ...view });

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  function goToNextProject() {
    if (currentSite < maxSites - 1) {
      setCurrentSite(currentSite + 1);
    } else {
      setCurrentSite(0);
    }
  }

  function goToPrevProject() {
    if (currentSite > 0) {
      setCurrentSite(currentSite - 1);
    } else {
      setCurrentSite(maxSites - 1);
    }
  }

  return (
    <div ref={parentRef} className={styles.mapContainer}>
      <MapGL
        ref={mapRef}
        {...mapState}
        {...viewport}
        mapboxApiAccessToken={mapboxToken}
        mapOptions={{
          customAttribution:
            '<a href="https://plant-for-the-planet.org/en/footermenu/privacy-policy">Privacy & Terms</a> <a href="https://plant-for-the-planet.org/en/footermenu/imprint">Imprint</a> <a href="mailto:support@plant-for-the-planet.org">Contact</a>',
        }}
        onViewportChange={_onViewportChange}
        onStateChange={_onStateChange}
        scrollZoom={false}
        onClick={() => setPopupData({ ...popupData, show: false })}
      >
        {showSingleProject ? (
          !siteExists ? (
            <Marker
              latitude={singleProjectLatLong[0]}
              longitude={singleProjectLatLong[1]}
              offsetLeft={5}
              offsetTop={-16}
              style={{ left: '28px' }}
            >
              <div className={styles.marker} />
            </Marker>
          ) : (
            <Source id="singleProject" type="geojson" data={geojson}>
              <Layer
                id="ploygonLayer"
                type="fill"
                source="singleProject"
                paint={{
                  'fill-color': '#fff',
                  'fill-opacity': 0.2,
                }}
              />
              <Layer
                id="ploygonOutline"
                type="line"
                source="singleProject"
                paint={{
                  'line-color': '#89b54a',
                  'line-width': 2,
                }}
              />
            </Source>
          )
        ) : null}

        {!showSingleProject &&
          exploreProjects &&
          projects.map((projectMarker: any, index: any) => (
            <Marker
              key={index}
              latitude={projectMarker.geometry.coordinates[1]}
              longitude={projectMarker.geometry.coordinates[0]}
              offsetLeft={5}
              offsetTop={-16}
              style={{ left: '28px' }}
            >
              <div
                className={styles.marker}
                onClick={() =>
                  router.push(
                    `/?p=${projectMarker.properties.slug}`,
                    undefined,
                    { shallow: true }
                  )
                }
                onKeyPress={() =>
                  router.push(
                    `/?p=${projectMarker.properties.slug}`,
                    undefined,
                    { shallow: true }
                  )
                }
                role="button"
                tabIndex={0}
                onMouseOver={() => {
                  timer = setTimeout(() => {
                    setPopupData({
                      show: true,
                      lat: projectMarker.geometry.coordinates[1],
                      long: projectMarker.geometry.coordinates[0],
                      project: projectMarker,
                    });
                  }, 300);
                }}
                onMouseLeave={() => {
                  clearTimeout(timer);
                }}
                onFocus={() => {}}
              >
                {/* <img
                src="https://cdn-app.plant-for-the-planet.org/media/maps/pet_p.svg"
                className={styles.markerType}
              /> */}
              </div>
            </Marker>
          ))}
        {popupData.show && !isMobile && (
          <Popup
            latitude={popupData.lat}
            longitude={popupData.long}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setPopupData({ ...popupData, show: false })}
            anchor="bottom"
            dynamicPosition={false}
            offsetTop={-15}
            tipSize={0}
          >
            <div
              className={styles.popupProject}
              onClick={() =>
                router.push(`/?p=${projectMarker.properties.slug}`, undefined, {
                  shallow: true,
                })
              }
              onKeyPress={() =>
                router.push(`/?p=${projectMarker.properties.slug}`, undefined, {
                  shallow: true,
                })
              }
              role="button"
              tabIndex={0}
              onMouseLeave={() => {
                if (!open) {
                  setTimeout(() => {
                    setPopupData({ ...popupData, show: false });
                  }, 300);
                  handleClose();
                }
              }}
            >
              <PopupProject
                key={popupData.project.properties.id}
                project={popupData.project}
                open={open}
                handleOpen={handleOpen}
                handleClose={handleClose}
              />
            </div>
          </Popup>
        )}
        {exploreForests ? (
          <Source
            id="forests"
            type="raster"
            tiles={[
              'https://tiles.arcgis.com/tiles/lKUTwQ0dhJzktt4g/arcgis/rest/services/Forest_Denisty_V2/MapServer/tile/{z}/{y}/{x}',
            ]}
            tileSize={128}
          >
            <Layer id="forest-layer" source="forests" type="raster" />
          </Source>
        ) : null}

        {explorePotential ? (
          <Source
            id="potential"
            type="raster"
            tiles={[
              ' https://earthengine.googleapis.com/map/80c988d5e8f6021ef9e6d2447f405c79/{z}/{x}/{y}?token=a5a5893006a0ea587845708b078df9ca',
            ]}
            tileSize={128}
          >
            <Layer id="potential-layer" source="potential" type="raster" />
          </Source>
        ) : null}

        {exploreDeforestation ? (
          <Source
            id="deforestation"
            type="raster"
            tiles={[
              'https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png',
            ]}
            tileSize={128}
          >
            <Layer
              id="deforestation-layer"
              source="deforestation"
              type="raster"
            />
          </Source>
        ) : null}
        <div className={styles.mapNavigation}>
          <NavigationControl showCompass={false} />
        </div>
        <div>
          <div
            className={styles.exploreButton}
            onClick={() => {
              if (exploreExpanded) {
                setExploreExpanded(false);
              } else {
                setExploreExpanded(true);
              }
            }}
          >
            {exploreExpanded ? <CancelIcon /> : <ExploreIcon />}
            {exploreExpanded ? null : (
              <p
                onClick={() => setExploreExpanded(true)}
                className={styles.exploreText}
              >
                Explore
              </p>
            )}
          </div>
          {exploreExpanded ? (
            <div className={styles.exploreExpanded}>
              <div>
                <FormGroup>
                  <div className={styles.exploreToggleRow}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exploreForests}
                          onChange={handleExploreForestsChange}
                          name="forest"
                        />
                      }
                      label="Forest"
                    />
                  </div>
                  <div className={styles.exploreToggleRow}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={explorePotential}
                          onChange={handleExplorePotentialChange}
                          name="potential"
                        />
                      }
                      label="Reforestation Potential"
                    />
                    {/* <FontAwesomeIcon icon={faInfoCircle} /> */}
                  </div>

                  <div className={styles.exploreToggleRow}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exploreDeforestation}
                          onChange={handleExploreDeforestationChange}
                          name="deforestation"
                        />
                      }
                      label="Deforestation"
                    />
                  </div>
                  {/* <div className={styles.exploreToggleRow}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={explorePlanted}
                          onChange={handleExplorePlantedChange}
                          name="planted"
                        />
                      }
                      label="Planted Trees"
                    />
                  </div> */}
                  <div className={styles.exploreToggleRow}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exploreProjects}
                          onChange={handleExploreProjectsChange}
                          name="projects"
                        />
                      }
                      label="Projects"
                    />
                  </div>
                </FormGroup>
              </div>
            </div>
          ) : null}
        </div>

        {showSingleProject && siteExists ? (
          maxSites! > 1 ? (
            <div className={styles.projectControls}>
              <div
                onClick={goToPrevProject}
                onKeyPress={goToPrevProject}
                role="button"
                tabIndex={0}
              >
                <LeftIcon />
              </div>

              <p className={styles.projectControlText}>
                &nbsp;&nbsp;
                {siteExists &&
                project.sites.length !== 0 &&
                geojson.features[currentSite]
                  ? geojson.features[currentSite].properties.name
                  : null}
                &nbsp;&nbsp;
              </p>
              <div
                onClick={goToNextProject}
                onKeyPress={goToNextProject}
                role="button"
                tabIndex={0}
              >
                <RightIcon />
              </div>
            </div>
          ) : null
        ) : null}
      </MapGL>
    </div>
  );
}
