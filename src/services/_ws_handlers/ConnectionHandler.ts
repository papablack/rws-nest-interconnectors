import { WSServiceInstance } from '@rws-framework/nest-interconnectors';


function ping(instance: WSServiceInstance): void {    
    instance.socket().emit('__PING__');
    // instance._timeout = setTimeout(() => {
    //     reconnect(instance);
    // }, 3000);
}


function reconnect(instance: WSServiceInstance): void {    
    disconnect(instance, true);
    const rc = instance.reconnects;
    if (rc < 2) {
        instance.executeEventListener('ws:reconnect', { reconnects: rc + 1 });        
        instance._connecting = true;
        instance.reconnects++;
        setTimeout(() => {
            instance.init();
            instance.reconnects = rc + 1;
        }, 1500);

        instance.statusChange();
    } else {
        disconnect(instance);
    }
}
function disconnect(instance: WSServiceInstance, noEvent = false): void {

    if(instance.socket()){
        instance.socket().disconnect();
    }

    if(!noEvent){
        console.log(`{WS}${instance.socket() ? `(${instance.socket().id}):` : ''} Disconnected from WS`);
        instance.executeEventListener('ws:disconnected');
    }
    
    clearInterval(instance._interval);

    instance._connecting = false;
    instance._shut_down = true;

    instance.statusChange();
}    

export {
    ping,
    reconnect,
    disconnect
};