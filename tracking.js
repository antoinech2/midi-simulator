const prompt = require('prompt-async');
const sprompt = require('prompt-sync')({ sigint: true });
const { midiOutput, close } = require('./midi')

const lights = require("./data/fixtures.json")


async function setupMidiLink() {
    let finished = false;

    lights.forEach(async (value) => {
        for (const key in value.midi) {
            prompt.get([`Assignez le MIDI ${key} du projecteur ${value.name}`], () => { finished = true })
            while (!finished) {
                midiOutput.send("cc", {
                    channel: 1,
                    value: 100,
                    controller: value.midi[key]
                })
                await sleep(500);
            }
            finished = false;
        }
    }
    )
}

function calculateDmxValue(light, position) {
    let x = -(light.x - position.x)
    let y = -(light.y - position.y)
    let z = -(light.z - position.z)
    let rho = Math.sqrt(x ** 2 + y ** 2 + z ** 2)
    let theta = Math.acos(z / rho) * 180 / Math.PI + light.tilt
    let phi = Math.atan2(y, x) * 180 / Math.PI + light.pan
    let pan = (phi + 180) / 360 * 171
    let panMidiValue = Math.trunc((phi + 180) / 360 * 127)
    let milli_pan = Math.round(128 * (pan - Math.trunc(pan)))
    let tilt
    let milli_tilt
    pan = Math.trunc(pan)
    if (theta < 55) {
        console.log(`Tilt of ${theta}° is unreachable`)
        tilt = 0
        milli_tilt = 0
    }
    else if (theta == 180){
        tilt = 127
        milli_tilt = 127
    }
    else {
        tilt = (theta - 55) / 125 * 128
        milli_tilt = Math.round(127 * (tilt - Math.trunc(tilt)))
    }
    tilt = Math.trunc(tilt)
    console.log({ phi, theta, pan, milli_pan, tilt, milli_tilt })
    return { pan : panMidiValue, milli_pan, tilt, milli_tilt }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function init(){
    midiOutput.send("cc", {
        channel: 2,
        value: 0,
        controller: 0
    })
}

async function track(light, position) {
    values = calculateDmxValue(light, position)
    for (const key in light.midi) {
        console.log(values, values[key], light.midi[key], light.midi)
        midiOutput.send("cc", {
            channel: 1,
            value: values[key],
            controller: light.midi[key]
        })
        await sleep(2)
    }
}

async function test(){
    const x = sprompt("Coord x : ");
    const y = sprompt("Coord y : ");
    const z = sprompt("Coord z : ");
    await track(lights[0], { x, y, z })
    console.log("Succès !")
    test()
}

//setupMidiLink()

//const pos = {x:-200, y:800, z:100}
//track(lights[0], pos)


init()
test()
close()

