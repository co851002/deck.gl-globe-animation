import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

import { _GlobeView as GlobeView, COORDINATE_SYSTEM } from '@deck.gl/core';
import { Flex, Affix, Button,Select, rem } from '@mantine/core';


const RotatingGlobe = () => {
    const [viewState, setViewState] = useState({
        latitude: 48.86,
        longitude: 2.27,
        zoom: 1,
        minZoom: 0,
        maxZoom: 20,
        pitch: 0,
        bearing: 0,
    });

    const [rotate, setRotate] = useState(false);
    const [rotationSpeed, setRotationSpeed] = useState(1);
    const [targetLongitude, setTargetLongitude] = useState(null);
    const [selectedLongitude, setSelectedLongitude] = useState(0);



    const easing = (t) => {
        return t * (2 - t);
    };

    useEffect(() => {
        let animationInterval;
        let startTime;

        if (rotate) {
            startTime = Date.now();

            animationInterval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const t = elapsedTime / 2000;
                const easedT = easing(t);
                // const rotationSpeed = 10 * (1 - easedT);
                const rotationSpeed = (targetLongitude - viewState.longitude) * (1 - easedT);

                setViewState((prevViewState) => {
                    return { ...prevViewState, longitude: prevViewState.longitude + rotationSpeed };
                });

                if (t >= 1) {
                    setRotate(false);
                    clearInterval(animationInterval);
                }
            }, 30);
        } else {
            clearInterval(animationInterval);
        }

        return () => clearInterval(animationInterval);
    }, [rotate]);
    const layers = [
        new TileLayer({
            id: 'tile-layer',
            data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            minZoom: 0,
            maxZoom: 19,
            tileSize: 256,

            renderSubLayers: (props) => {
                const {
                    bbox: { west, south, east, north },
                } = props.tile;

                return new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                    bounds: [west, south, east, north],
                });
            },
        }),
    ];

    const controller = {
        controller: true,
        inertia: true,
        touchRotate:true
      }

    const onClickHandler = (targetLon) => {
        if (!rotate) {
            setTargetLongitude(targetLon);
            setRotate(true);
        }
    };

    const handleLongitudeChange = (event) => {
        setSelectedLongitude(parseFloat(event.target.value));
    };

    return (
        <div>
            <DeckGL
                width="100%"
                height="100%"
                layers={layers}
                viewState={viewState}
                onViewStateChange={({ viewState }) => setViewState(viewState)}
                views={new GlobeView()}
                controller={controller}
            />

            {/* <select value={selectedLongitude} onChange={handleLongitudeChange} style={{ position: 'absolute', top: 10, left: 10 }}>
                <option value="0.127">London</option>
                <option value="84.124">Nepal</option>
            </select> */}

            <Affix position={{ bottom: rem(20), right: rem(20) }}>
            <Flex
      mih={50}
      bg="rgba(0, 0, 0, .0)"
      gap="md"
      justify="flex-start"
      align="flex-start"
      direction="row"
      wrap="wrap"
    >
      <Select
      placeholder="Location"
      value={selectedLongitude} onChange={handleLongitudeChange}
      data={[
        { value: '0.127', label: 'London' },
        { value: '84.124', label: 'Nepal' },
       
      ]}
    />
                <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }} onClick={() => onClickHandler(selectedLongitude)}>
                    Spin
                </Button>
    </Flex>


            


            </Affix>






        </div>
    );
};

export default RotatingGlobe;
