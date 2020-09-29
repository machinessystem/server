const admin = require('firebase-admin');
const _ = require('lodash');
const db = admin.database();
const devCheck = require('../middlewares/dev');
const router = require('express').Router();

router.post('/', devCheck, async (req, res, next) => {
    const { reqType } = req.body;
    if (!reqType) return res.status(404).send('error:no-req');
    switch (reqType) {
        case 'get-defs':
            let defs = '{D';
            getCPU(req, res, next, async () => {
                await getPinDefinitions(req, res, next, () => {
                    let sortedConfiguration = req.pin_configuration.sort((a, b) => a['pinNo'] - a['pinNo']);
                    sortedConfiguration.forEach(config => {
                        let result = req.definitions.find(def => def.pinNo == config.pinNo);
                        if (result) {
                            const { pinMode } = result;
                            if (pinMode == "input") defs += '1';
                            else if (pinMode == "output") defs += '0';
                        } else defs += '2';
                    });
                    res.send(`${defs}}`);
                })
            })
            break;

        case 'get-cmds':
            let cmds = '{C';
            await getCPU(req, res, next, async () => {
                await getPinDefinitions(req, res, next, async () => {
                    await getCommands(req, res, next, () => {
                        let sortedConfiguration = req.pin_configuration.sort((a, b) => a['pinNo'] - a['pinNo']);
                        let commands = req.commands;
                        sortedConfiguration.forEach(config => {
                            let pin = Object.keys(commands).find(pin => pin == config.pinNo);
                            if (pin) {
                                let newCmd = 0;
                                console.log(commands)
                                Object.keys(commands[pin]).forEach(cmd => {

                                    console.log(commands[pin][cmd])
                                    newCmd = commands[pin][cmd] === "OFF" ? "0" : "1";
                                    // newCmd = commands[pin][]['val']
                                })
                                cmds += newCmd;
                            } else cmds += '2';
                        })
                        res.send(`${cmds}}`);
                    })
                })
            });
            break;

        case 'set-readings':
            const { value } = req.body;
            if (value == undefined || !value == null) return res.status(404).send('error:no-value-found');
            const { pinNo } = req.body;
            if (!pinNo) return res.status(404).send('error:no-pinNo-found');
            const { instance } = req;
            if (!instance) return res.status(404).send('error:no-instance');
            const { key } = instance;
            if (!key) return res.status(404).send('error:no-instanceId');
            let time = new Date().toISOString();
            db.ref(`pinDefinitions/${key}`).orderByChild('pinNo').equalTo(pinNo).once('value', async (snapshot) => {
                if (!snapshot.val()) return res.status(404).send('error:no-pin-definition-found');
                const result = await db.ref(`instancesReadings/${key}/${pinNo}`).push({ reading: value, time: time })
                if (result) return res.send('success:done');
                return res.status(500).send('error:unknown');
            });
            break;
    }
});


async function getCPU(req, res, next, callBack) {
    const { instance } = req;
    if (!instance) return res.status(404).send('error:no-instance');
    const { cpuId } = req.instance.val();
    if (!cpuId) return res.status(404).send('error:no-cpuId');

    const cpu = await db.ref(`modules/${cpuId}`).once('value');
    if (!cpu.val()) return res.status(404).send('error:no-cpu');
    req.cpu = cpu.val();
    callBack();
}

async function getPinDefinitions(req, res, next, callBack) {
    const { instance } = req;
    if (!instance) return res.status(404).send('error:no-instance');
    const { key } = instance;
    if (!key) return res.status(404).send('error:no-instanceId');
    const { cpu } = req;
    if (!cpu) return res.status(404).send('error:no-cpu');
    const { description } = cpu;
    if (!description) return res.status(404).send('error:no-cpu-description');
    const { pin_configuration } = description;
    if (!pin_configuration) return res.status(404).send('error:no-pin-configuration');
    let pins = []
    Object.keys(pin_configuration).forEach((pin) => {
        pins.push({ ...pin_configuration[pin], pinNo: pin, })
    })
    req.pin_configuration = pins;
    const definitions = await db.ref(`pinDefinitions/${key}`).once('value');
    if (!definitions.val()) return res.status(404).send('error:no-cmd-found');
    let pinDefinitions = []
    definitions.forEach(def => {
        pinDefinitions.push({ pinNo: def.key, ...def.val() })
    })
    req.definitions = pinDefinitions;
    callBack();
}

async function getCommands(req, res, next, callBack) {
    const { instance } = req;
    if (!instance) return res.status(404).send('error:no-instance');
    const { key } = instance;
    if (!key) return res.status(404).send('error:no-instanceId');
    const commands = await db.ref(`instancesCommands/${key}`).once('value');
    if (!commands.val()) return res.status(404).send('error:no-cmd-found');
    req.commands = commands.val();
    callBack();
}


module.exports = router;