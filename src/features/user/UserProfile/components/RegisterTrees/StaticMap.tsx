import React, { ReactElement } from 'react';
import * as turf from '@turf/turf';
import * as d3 from 'd3-ease';
import ReactMapboxGl, { GeoJSONLayer, Marker } from 'react-mapbox-gl';
import DrawControl from 'react-mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import WebMercatorViewport from '@math.gl/web-mercator';
import styles from '../../styles/RegisterModal.module.scss';

const MAPBOX_TOKEN = process.env.MAPBOXGL_ACCESS_TOKEN;

const Map = ReactMapboxGl({
    accessToken: MAPBOX_TOKEN,
    interactive: false
});

interface Props {
    geoJson: any;
}

export default function StaticMap({ geoJson }: Props): ReactElement {
    const defaultMapCenter = [-28.5, 36.96];
    const defaultZoom = 1.4;
    const [viewport, setViewPort] = React.useState({
        height: '100%',
        width: '100%',
        center: defaultMapCenter,
        zoom: [defaultZoom],
    });
    const [viewport2, setViewPort2] = React.useState({
        height: 200,
        width: 350,
        center: defaultMapCenter,
        zoom: defaultZoom,
    });
    const [isPoint, setIsPoint] = React.useState(false);

    React.useEffect(() => {
        if (geoJson) {
            if (geoJson.type === 'Point') {
                setIsPoint(true)
            } else {
                setIsPoint(false)
            }
        }
    }, [geoJson]);

    React.useEffect(() => {
        if (isPoint) {
            setViewPort({
                ...viewport,
                center: geoJson.coordinates,
                zoom: [5],
            })
        } else {
            if (geoJson) {
                const bbox = turf.bbox(geoJson);
                const { longitude, latitude, zoom } = new WebMercatorViewport(
                    viewport2
                ).fitBounds([
                    [bbox[0], bbox[1]],
                    [bbox[2], bbox[3]],
                ]);
                const newViewport = {
                    ...viewport,
                    center: [longitude, latitude],
                    zoom: [zoom - 0.5],
                };
                setViewPort(newViewport);
            }
        }
    }, [isPoint]);
    return (
        <Map
            {...viewport}
            style="mapbox://styles/mapbox/streets-v11?optimize=true" // eslint-disable-line
            containerStyle={{
                height: '100%',
                width: '100%',
            }}
        >
            {isPoint ?
                (<Marker coordinates={geoJson.coordinates} anchor="bottom">
                    <div className={styles.marker} />
                </Marker>)
                : (geoJson ? <GeoJSONLayer
                    data={geoJson}
                    fillPaint={{
                        'fill-color': '#fff',
                        'fill-opacity': 0.2,
                    }}
                    linePaint={{
                        'line-color': '#89b54a',
                        'line-width': 2,
                    }}
                /> : null)}
        </Map>
    )
}
