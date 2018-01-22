
export default class PEP {
   constructor(private send: (stanzaElement: Element) => void,
      private sendIQ: (stanzaElement: Element) => Promise<Element>,
      private connection, private account) {

   }

   public subscribe(node: string, handler: (stanza: string) => boolean, force: boolean = false) {
      this.account.getDiscoInfo().addFeature(node);
      this.account.getDiscoInfo().addFeature(`${node}+notify`);

      this.connection.registerHandler(handler, 'http://jabber.org/protocol/pubsub#event', 'message', null, null, null);

      if (force)
         return this.connection.sendPresence();
   }

   public unsubscribe(node: string, force: boolean = false) {
      this.account.getDiscoInfo().removeFeature(node)
      this.account.getDiscoInfo().removeFeature(`${node}+notify`)

      if (force)
         return this.connection.sendPresence();
   }

   public publish(node: string, element: Element): Promise<Element> {
      let iqStanza = $iq({
         type: 'set',
      }).c('pubsub', {
         xmlns: 'http://jabber.org/protocol/pubsub'
      }).c('publish', {
         node: node
      }).c('item').cnode(element);

      return this.sendIQ(iqStanza);
   }

   public retrieveItems(node: string, jid?: string) {
      let iq = $iq({
         to: jid,
         type: 'get'
      });

      iq.c('pubsub', {
         xmlns: 'http://jabber.org/protocol/pubsub'
      });
      iq.c('items', {
         node: node
      });

      return this.sendIQ(iq);
   }
}