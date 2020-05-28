import { FastifyInstance } from 'fastify';
import createError from 'http-errors';
import {
  getQrClaim,
  getFreeReceiverAddress,
  getActiveLockForBeneficiary,
  createReceiverLock
} from '../db';


export default async function subscriptionRoutes(fastify: FastifyInstance) {

  fastify.get(
    '/subscription/lock',
    {
      schema: {
        description: 'Get the active lock for a beneficiary',
        tags: ['Subscriptions',],
        querystring: {
          beneficiary: { type: 'string' },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              is_active: { type: 'boolean' },
              subscription_address: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  address: { type: 'string' },
                  name: { type: 'string' },
                  qr_code_image: { type: 'string' }
                }
              },
              beneficiary: { type: 'string' },
              created_at: { type: 'string' },
              unlocked_at: { type: 'string' },
              expires_at: { type: 'string' }
            }
          }
        }
      },
    },
    async (req, res) => {
      // Check beneficiary validity
      const beneficiary = req.query.beneficiary;
      if (!beneficiary) {
        return new createError.BadRequest('Missing beneficiary on query string');
      }
      // Check beneficiary locks
      let receiverLock = await getActiveLockForBeneficiary(beneficiary);
      console.log(receiverLock);
      if (!receiverLock) {
        return new createError.NotFound('Lock not found');
      }

      return receiverLock
    }
  );

  fastify.post(
    '/subscription/lock',
    {
      schema: {
        description: 'Lock an account to create a new subscription',
        tags: ['Subscriptions',],
        body: {
          type: 'object',
          required: ['qr_hash'],
          properties: {
            qr_hash: { type: 'string' },
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              is_active: { type: 'boolean' },
              subscription_address: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  address: { type: 'string' },
                  name: { type: 'string' },
                  qr_code_image: { type: 'string' }
                }
              },
              beneficiary: { type: 'string' },
              created_at: { type: 'string' },
              unlocked_at: { type: 'string' },
              expires_at: { type: 'string' }
            }
          }
        }
      },
    },
    async (req, res) => {
      // Check claim validity
      const qr_claim = await getQrClaim(req.body.qr_hash);
      if (!qr_claim) {
        return new createError.NotFound('QR Claim not found');
      }

      if (!qr_claim.beneficiary) {
        return new createError.BadRequest('QR Claim not claimed yet');
      }

      // Check that beneficiary is not already locked
      if (await getActiveLockForBeneficiary(qr_claim.beneficiary)) {
        return new createError.BadRequest('Beneficiary already has a lock');
      }

      // Get an empty receiver address
      const receiverAddress = await getFreeReceiverAddress();

      if (!receiverAddress) {
        return new createError.BadRequest('There are not free receiver addresses');
      }

      // Create subscription lock
      let receiverLock = await createReceiverLock(receiverAddress, qr_claim.beneficiary);

      return receiverLock
    }
  );
}
