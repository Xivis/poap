import { getDefaultProvider } from 'ethers';
import { FastifyInstance } from 'fastify';
import createError from 'http-errors';
import {
  getEvent, getEventByFancyId, getEvents, updateEvent, createEvent,
  getPoapSettingByName, getPoapSettings, updatePoapSettingByName
} from './db';
import {
  getAllTokens,
  getTokenInfo,
  mintToken,
  mintEventToManyUsers,
  verifyClaim,
  mintUserToManyEvents,
  burnToken
} from './poap-helper';
import { Claim, PoapEvent } from './types';

function buildMetadataJson(tokenUrl: string, ev: PoapEvent) {
  return {
    description: ev.description,
    external_url: tokenUrl,
    home_url: tokenUrl,
    image: ev.image_url,
    image_url: ev.image_url,
    name: ev.name,
    year: ev.year,
    tags: ['poap', 'event'],
    attributes: [
      {
        trait_type: 'startDate',
        value: ev.start_date,
      },
      {
        trait_type: 'endDate',
        value: ev.end_date,
      },
      {
        trait_type: 'city',
        value: ev.city,
      },
      {
        trait_type: 'country',
        value: ev.country,
      },
      {
        trait_type: 'eventURL',
        value: ev.event_url,
      },
    ],
    properties: [],
  };
}

export default async function routes(fastify: FastifyInstance) {
  fastify.addSchema({
    $id: 'address',
    type: 'string',
    minLength: 42,
    maxLength: 42,
    pattern: '^0x[0-9a-fA-F]{40}$',
  });

  fastify.addSchema({
    $id: 'signature',
    type: 'string',
    minLength: 132,
    maxLength: 132,
    pattern: '^0x[0-9a-fA-F]{130}$',
  });

  fastify.get('/metadata/:eventId/:tokenId', async (req, res) => {
    const event = await getEvent(parseInt(req.params.eventId));
    if (!event) {
      throw new createError.NotFound('Invalid Event');
    }
    const tokenUrl = `https://api.poap.xyz/metadata/${req.params.eventId}/${req.params.tokenId}`;
    return buildMetadataJson(tokenUrl, event);
  });

  fastify.get(
    '/actions/ens_resolve',
    {
      schema: {
        querystring: {
          name: { type: 'string' },
        },
      },
    },
    async (req, res) => {
      const mainnetProvider = getDefaultProvider('homestead');

      if (req.query['name'] == null || req.query['name'] == '') {
        throw new createError.BadRequest('"name" query parameter is required');
      }

      const resolvedAddress = await mainnetProvider.resolveName(req.query['name']);

      if (resolvedAddress == null) {
        return {
          valid: false,
        };
      } else {
        return {
          valid: true,
          address: resolvedAddress,
        };
      }
    }
  );

  fastify.get(
    '/actions/scan/:address',
    {
      schema: {
        params: {
          address: 'address#',
        },
      },
    },
    async (req, res) => {
      const address = req.params.address;
      const tokens = await getAllTokens(address);
      return tokens;
    }
  );

  fastify.post(
    '/actions/mintEventToManyUsers',
    {
      preValidation: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['eventId', 'addresses'],
          properties: {
            eventId: { type: 'integer', minimum: 1 },
            addresses: {
              type: 'array',
              minItems: 1,
              items: 'address#',
            },
          },
        },
      },
    },
    async (req, res) => {
      await mintEventToManyUsers(req.body.eventId, req.body.addresses);
      res.status(204);
      return;
    }
  );
  fastify.post(
    '/actions/mintUserToManyEvents',
    {
      preValidation: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['eventIds', 'address'],
          properties: {
            eventIds: { type: 'array', minItems: 1, items: { type: 'integer', minimum: 1 } },
            address: 'address#',
          },
        },
      },
    },
    async (req, res) => {
      await mintUserToManyEvents(req.body.eventIds, req.body.address);
      res.status(204);
      return;
    }
  );

  fastify.post(
    '/actions/claim',
    {
      schema: {
        body: {
          type: 'object',
          required: ['claimId', 'eventId', 'proof', 'claimer', 'claimerSignature'],
          properties: {
            claimId: { type: 'string' },
            eventId: { type: 'integer', minimum: 1 },
            proof: 'signature#',
            claimer: 'address#',
            claimerSignature: 'signature#',
          },
        },
      },
    },
    async (req, res) => {
      const claim: Claim = req.body;
      const isValid = await verifyClaim(claim);
      if (isValid) {
        await mintToken(claim.eventId, claim.claimer);
        res.status(204);
      } else {
        throw new createError.BadRequest('Invalid Claim');
      }
    }
  );

  fastify.get(
    '/token/:tokenId',
    {
      schema: {
        params: {
          tokenId: { type: 'integer' },
        },
      },
    },
    async (req, res) => {
      const tokenId = req.params.tokenId;
      const tokenInfo = await getTokenInfo(tokenId);
      return tokenInfo;
    }
  );

  fastify.post(
    '/burn/:tokenId',
    {
      // preValidation: [fastify.authenticate],
      schema: {
        params: {
          tokenId: { type: 'integer' },
        },
      },
    },
    async (req, res) => {
      const isOk = await burnToken(req.params.tokenId);
      if (!isOk) {
        return new createError.NotFound('Invalid token or action');
      }
      res.status(204);
      return;
    }
  );

  fastify.get('/settings', () => getPoapSettings());

  fastify.get(
    '/settings/:name',
    {
      schema: {
        params: {
          name: { type: 'string' },
        },
      },
    },
    async (req, res) => {
      const value = await getPoapSettingByName(req.params.name);
      if (!value) {
        return new createError.NotFound('poap setting variable not found');
      }
      return value;
    }
  );

  // TODO Update this endpoint to use value as body parameter
  fastify.put(
    '/settings/:name/:value',
    {
      preValidation: [fastify.authenticate],
      schema: {
        params: {
          name: { type: 'string' },
          value: { type: 'string' }
        },
      },
    },
    async (req, res) => {
      // Verify that setting variable exist
      const setting_type = await getPoapSettingByName(req.params.name);
      if (!setting_type) {
          return new createError.BadRequest('unsuccessful operation');
      }

      const isOk = await updatePoapSettingByName(req.params.name, setting_type['type'], req.params.value);
      if (!isOk) {
        return new createError.BadRequest('unsuccessful operation');
      }

      res.status(204);
      return;
    }
  );

  //********************************************************************
  // EVENTS
  //********************************************************************

  fastify.get('/events', () => getEvents());

  fastify.get(
    '/events/:fancyid',
    {
      schema: {
        params: {
          fancyid: { type: 'string' },
        },
      },
    },
    async (req, res) => {
      const event = await getEventByFancyId(req.params.fancyid);
      if (!event) {
        return new createError.NotFound('Invalid Event');
      }
      return event;
    }
  );

  fastify.post(
    '/events',
    {
      preValidation: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: [
            'fancy_id',
            'name',
            'description',
            'city',
            'country',
            'start_date',
            'end_date',
            'year',
            'event_url',
            'image_url',
            'signer',
            'signer_ip',
          ],
          properties: {
            fancy_id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            start_date: { type: 'string' },
            end_date: { type: 'string' },
            year: { type: 'integer' },
            event_url: { type: 'string' },
            image_url: { type: 'string' },
            signer: { anyOf: ['address#', { type: 'null' }] },
            signer_ip: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          },
        },
      },
    },
    async (req, res) => {
      const newEvent = {
        fancy_id: req.body.fancy_id,
        name: req.body.name,
        description: req.body.description,
        city: req.body.city,
        country: req.body.country,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        year: req.body.year,
        event_url: req.body.event_url,
        image_url: req.body.image_url,
        signer: req.body.signer,
        signer_ip: req.body.signer_ip,
      };

      const event = await createEvent(newEvent);
      if (event == null) {
        return new createError.BadRequest('Invalid event');
      }
      return event;
    }
  );

  fastify.put(
    '/events/:fancyid',
    {
      preValidation: [fastify.authenticate],
      schema: {
        params: {
          fancyid: { type: 'string' },
        },
        body: {
          type: 'object',
          required: ['signer', 'signer_ip', 'event_url', 'image_url'],
          properties: {
            signer: { anyOf: ['address#', { type: 'null' }] },
            signer_ip: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            event_url: { type: 'string' },
            image_url: { type: 'string' },
          },
        },
      },
    },
    async (req, res) => {
      const isOk = await updateEvent(req.params.fancyid, {
        signer: req.body.signer,
        signer_ip: req.body.signer_ip,
        event_url: req.body.event_url,
        image_url: req.body.image_url,
      });
      if (!isOk) {
        return new createError.NotFound('Invalid event');
      }
      res.status(204);
      return;
    }
  );
}
