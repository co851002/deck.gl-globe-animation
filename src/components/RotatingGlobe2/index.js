import React, { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import { _GlobeView as GlobeView, COORDINATE_SYSTEM } from "@deck.gl/core";
import { Flex, Affix, Button, Select, rem, Slider, Text } from "@mantine/core";

//Some predefined coords
const selectConfig = [
  { value: "0.127", label: "London" },
  { value: "84.124", label: "Nepal" },
  { value: "-74.00", label: "New York" },
  { value: "106.90", label: "Ulaanbaatar" },
];

//Some predefined coords
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

  //Rotation state
  const [rotate, setRotate] = useState(false);

  // Longitude from select
  const [selectedLongitude, setSelectedLongitude] = useState(null);
  const [targetLongitude, setTargetLongitude] = useState(null);

  // to force a state update - there's probably a better way to avoid rotate returining true when t >= 1
  const [spinCounter, setSpinCounter] = useState(0);

  //Slider & prop states for maxRotations and easing time
  const [maxRotations, setMaxRotations] = useState(5);
  const [easing, setEasing] = useState(2);

  useEffect(() => {
    let animationInterval;
    let startTime;
    let startLongitude;

    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    if (rotate) {
      startTime = Date.now();
      startLongitude = viewState.longitude;

      const extraRotation = 360 * maxRotations;
      const targetLonDiff =
        parseFloat(targetLongitude) - (startLongitude % 360);
      const finalTargetLongitude =
        startLongitude + targetLonDiff + extraRotation;

      animationInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const t = elapsedTime / (easing * 1000);
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
        <Slider
          labelAlwaysOn
          label={(maxRotations) => `${maxRotations}`}
          value={maxRotations}
          onChange={setMaxRotations}
          defaultValue={5}
          min={1}
          max={10}
          size="xs"
          radius="xs"
          style={{ margin: "20px auto 0" }}
        />
        <Text fz="sm">Max Rotations</Text>

        <Slider
          labelAlwaysOn
          label={(easing) => `${easing}`}
          value={easing}
          onChange={setEasing}
          defaultValue={2}
          min={1}
          max={10}
          size="xs"
          radius="xs"
          style={{ margin: "20px auto 0" }}
        />
        <Text fz="sm">Easing Duration (secs)</Text>

        <Flex
          mih={60}
          bg="rgba(0, 0, 0, .0)"
          gap="md"
          justify="center"
          align="end"
          direction="row"
          wrap="wrap"
          style={{ margin: "20px auto 0" }}
        >
          <Select
            label="Select a country"
            placeholder="Location"
            value={selectedLongitude}
            onChange={handleLongitudeChange}
            data={selectConfig}
            defailtValue="Blahhh"
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
