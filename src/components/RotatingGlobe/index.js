import React, { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import { _GlobeView as GlobeView, COORDINATE_SYSTEM } from "@deck.gl/core";

import {
  Grid,
  Affix,
  Button,
  Select,
  rem,
  Slider,
  Text,
  Container,
  Center,
} from "@mantine/core";

//Some predefined coords
const selectConfig = [
  { value: "0.12", label: "London" },
  { value: "84.12", label: "Kathmandu" },
  { value: "106.90", label: "Ulaanbaatar" },
  { value: "-74.00", label: "New York" },
  { value: "-123.19", label: "Vancouver" },
];

//Start coords
const initCoords = {
  lat: 48.86,
  lon: 2.27,
};

//Deck.gl config stuff
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
  const [selectedLongitude, setSelectedLongitude] = useState(initCoords.lon);
  const [targetLongitude, setTargetLongitude] = useState(null);

  // to force a state update - there's probably a better way to avoid rotate returining true when t >= 1
  const [spinCounter, setSpinCounter] = useState(0);

  //Slider & prop states for maxRotations and easing time
  //const [maxRotations, setMaxRotations] = useState(8);
  const [rotations, setRotations] = useState(5);
  const [spinSpeed, setSpinSpeed] = useState(5);
  const [easing, setEasing] = useState(15);

  useEffect(() => {
    let animationInterval, startTime, startLongitude;
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    if (rotate) {
      startTime = Date.now();
      startLongitude = viewState.longitude;
      const extraRotation = 360 * rotations * spinSpeed;
      const targetLonDiff =
        parseFloat(targetLongitude) - (startLongitude % 360);
      const finalTargetLongitude =
        startLongitude + targetLonDiff + extraRotation;
      animationInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const t = elapsedTime / (easing * 1000);
        const easedT = easeOutQuart(t);
        const newLongitude =
          startLongitude + (finalTargetLongitude - startLongitude) * easedT;
        // console.log("new lon:", newLongitude);
        setViewState((prevViewState) => {
          return {
            ...prevViewState,
            longitude: newLongitude,
          };
        });

        if (t >= 1) {
          clearInterval(animationInterval);
        }
      }, 30);
    } else {
      clearInterval(animationInterval);
    }

    return () => clearInterval(animationInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinCounter]);

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
        height="100%"
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        views={new GlobeView()}
        controller={controller}
      />

      <Affix
        position={{ bottom: rem(10), right: rem(10), width: 300 }}
        style={{
          background: "rgb(0 0 0 / 7%",
          borderRadius: "5px",
          padding: "20px 0",
        }}
      >
        <Container fluid>
          <Grid
            gutter={5}
            gutterXs="md"
            gutterMd="xl"
            gutterXl={50}
            align="flex-end"
            mx="12"
          >
            <Grid.Col xs={12}>
              <Text fz="xs">Rotation Multiplier</Text>
              <Slider
                label={(rotations) => `${rotations}`}
                value={rotations}
                onChange={setRotations}
                defaultValue={5}
                min={2}
                max={10}
                size="xs"
                radius="xs"
                style={{ margin: "20px auto 0", width: "100%" }}
              />
            </Grid.Col>

            <Grid.Col xs={12}>
              <Text fz="xs">Spin Speed</Text>
              <Slider
                label={(spinSpeed) => `${spinSpeed}`}
                value={spinSpeed}
                onChange={setSpinSpeed}
                defaultValue={2}
                min={2}
                max={10}
                size="xs"
                radius="xs"
                style={{ margin: "20px auto 0", width: "100%" }}
              />
            </Grid.Col>

            <Grid.Col xs={12}>
              <Text fz="xs">Easing Duration</Text>
              <Slider
                label={(easing) => `${easing}`}
                value={easing}
                onChange={setEasing}
                defaultValue={10}
                min={5}
                max={25}
                size="xs"
                radius="xs"
                style={{ margin: "20px auto 0", width: "100%" }}
              />
            </Grid.Col>

            {/* <Grid.Col xs={12}>
              <Text fz="xs">
                Spin duration: {phaseOneDuration + phaseTwoDuration} seconds{" "}
              </Text>
            </Grid.Col> */}

            <Grid.Col xs={12}>
              <Select
                fz="xs"
                label="Select a country"
                placeholder="Location"
                value={selectedLongitude}
                onChange={handleLongitudeChange}
                data={selectConfig}
              />
            </Grid.Col>

            <Grid.Col xs={12} items={"center"}>
              <Center maw={300} h={50} mx="auto">
                <Button
                  variant="gradient"
                  gradient={{ from: "indigo", to: "cyan" }}
                  onClick={() => onClickHandler(selectedLongitude)}
                >
                  Spin
                </Button>
              </Center>
            </Grid.Col>
          </Grid>
        </Container>
      </Affix>
    </div>
  );
};

export default RotatingGlobe;
