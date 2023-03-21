import React, { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import { _GlobeView as GlobeView, COORDINATE_SYSTEM } from "@deck.gl/core";
import { Flex, Center, Affix, Button, Select, rem } from "@mantine/core";

const initCoords = {
  lat: 48.86,
  lon: 2.27,
};

const RotatingGlobe = () => {
  const [viewState, setViewState] = useState({
    latitude: initCoords.lat,
    longitude: initCoords.lon,
    zoom: isMobile ? 0.1 : 0.5,
    minZoom: 0,
    maxZoom: 20,
    pitch: 0,
    bearing: 10,
  });

  const [rotate, setRotate] = useState(false);

  // Long from select
  const [selectedLongitude, setSelectedLongitude] = useState(null);

  const [targetLongitude, setTargetLongitude] = useState(null);

  // to force a state update- probably a better way to avoid roate returining true when t >= 1
  const [spinCounter, setSpinCounter] = useState(0);

  const selectConfig = [
    { value: "0.127", label: "London" },
    { value: "84.124", label: "Nepal" },
    { value: "-74.00", label: "New York" },
    { value: "106.90", label: "Ulaanbaatar" },
  ];

  // Nah
  //   const easing = (t) => {
  //     return t * (2 - t);
  //   };

  useEffect(() => {
    let animationInterval;
    let startTime;
    let startLongitude;

    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    if (rotate) {
      startTime = Date.now();
      startLongitude = viewState.longitude;
      const rotations = 5;
      const extraRotation = 360 * rotations;
      const targetLonDiff = parseFloat(targetLongitude) - (startLongitude % 360);
      const finalTargetLongitude = startLongitude + targetLonDiff + extraRotation;

      animationInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const t = elapsedTime / 2000;
        const easedT = easeInOutQuad(t);
        const newLongitude =
          startLongitude + (finalTargetLongitude - startLongitude) * easedT;

        setViewState((prevViewState) => {
          return {
            ...prevViewState,
            longitude: newLongitude,
            // latitude: initCoords.lat, // To have the lat fixed to initCoords
          };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinCounter]);

  const layers = [
    new TileLayer({
      id: "tile-layer",
      data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
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
    inertia: 3000,
    touchRotate: true,
  };

  const onClickHandler = (targetLon) => {
    if (!rotate) {
      setTargetLongitude(targetLon);
      setRotate(true);
      setSpinCounter((prevCounter) => prevCounter + 1);
    }
  };

  const handleLongitudeChange = (e) => {
    setRotate(false);
    console.log("e", e);
    setSelectedLongitude(e);
  };

  return (
    <div>
      <DeckGL
        width="100%"
        height="90%"
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        views={new GlobeView()}
        controller={controller}
      />

      <Affix position={{ bottom: rem(20), right: rem(15) }}>
        <Flex
          mih={100}
          bg="rgba(0, 0, 0, .0)"
          gap="md"
          justify="center"
          align="end"
          direction="row"
          wrap="wrap"
        >
          <Select
            label="Select a country"
            placeholder="Location"
            value={selectedLongitude}
            onChange={handleLongitudeChange}
            data={selectConfig}
          />
          <Button
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
            onClick={() => onClickHandler(selectedLongitude)}
          >
            Spin
          </Button>
        </Flex>
      </Affix>
    </div>
  );
};

export default RotatingGlobe;
