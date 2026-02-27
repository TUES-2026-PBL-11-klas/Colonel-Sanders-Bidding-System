import { authService } from './authService'

const API_BASE_URL = 'http://localhost:8080/api'

export interface ProductType {
	id: number
	name: string
}

export interface Auction {
	id: number
	productType: ProductType
	model: string
	description: string
	serial: string
	closed: boolean
	imageObjectKey: string | null
	startingPrice: number
	createdAt?: string
	updatedAt?: string
	actionEndDate?: string
}

const buildAuthHeaders = () => {
	const token = authService.getToken()

	return {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	}
}

async function parseError(response: Response): Promise<never> {
	let message = `Request failed with status ${response.status}`

	try {
		const error = await response.json()
		message = error.message || message
	} catch {
		// keep default message when body is not JSON
	}

	throw new Error(message)
}

export const auctionsService = {
	async getAuctions(): Promise<Auction[]> {
		const response = await fetch(`${API_BASE_URL}/products`, {
			method: 'GET',
			headers: buildAuthHeaders(),
			credentials: 'include',
		})

		if (!response.ok) {
			return parseError(response)
		}

		return response.json()
	},

	async getAuctionById(id: number): Promise<Auction> {
		const response = await fetch(`${API_BASE_URL}/products/${id}`, {
			method: 'GET',
			headers: buildAuthHeaders(),
			credentials: 'include',
		})

		if (!response.ok) {
			return parseError(response)
		}

		return response.json()
	},

	async getOpenAuctions(): Promise<Auction[]> {
		const auctions = await this.getAuctions()
		return auctions.filter((auction) => !auction.closed)
	},
}
