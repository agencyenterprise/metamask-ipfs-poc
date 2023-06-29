import { IPFSAbstract } from '../../IPFSAbstract';
import { config } from './config';

export class PinataIPFSService extends IPFSAbstract {
  async delete(hash: string): Promise<boolean> {
    if (!config.token) {
      throw new Error('Pinata token not found');
    }
    const response = await fetch(`${config.url}/pinning/unpin/${hash}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.token}`,
      },
    });
    if (!response.ok) {
      throw new Error('failed to delete');
    }
    return true;
  }

  async update(hash: string, data: string): Promise<string> {
    if (!config.token) {
      throw new Error('Pinata token not found');
    }
    await this.delete(hash);
    const response = await this.put(data);
    return response;
  }

  async put(data: string): Promise<string> {
    const uuid = Math.random().toString(36).substring(7);

    if (!config.token) {
      throw new Error('Pinata token not found');
    }

    const response = await fetch(`${config.url}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        pinataMetadata: {
          name: `snap-${uuid}`,
        },
        pinataContent: data,
      }),
    });
    if (!response.ok) {
      console.log(response);
      throw new Error('failed to upload');
    }
    const json = await response.json();
    return json.IpfsHash;
  }

  async get(cid: string): Promise<string> {
    const response = await fetch(`${config.gatewayUrl}/ipfs/${cid}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('failed to get');
    }
    const data = await response.json();
    return data;

    // const response = await fetch(
    //   `${config.url}/data/pinList?hashContains=${hash}`,
    //   {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${config.token}`,
    //     },
    //   },
    // );
    // if (!response.ok) {
    //   throw new Error('failed to get');
    // }
    // const data = await response.json();
    // console.log({ data });
    // return data;
  }
}
