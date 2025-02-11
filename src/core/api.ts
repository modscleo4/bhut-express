import env from "./env.js";

type AuthInfo = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresAt: Date;
};

type Pagination = {
    pagina: number;
    tamanhoPagina: number;
    total: number;
};

type Car = {
    id: string;
    nome: string;
    marca: string;
    preco: number;
    anoFabricacao: number;
    ativo: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
};

export class BHUTError extends Error {
    override name = 'BHUTError';

    constructor(message: string, public readonly statusCode: number) {
        super(message);
    }
}


let authInfo: AuthInfo | undefined;

export async function getCars(active: boolean = true): Promise<Car[]> {
    const size = 10;

    const { paginacao, itens } = await performGetCars(active, 1, size);
    for (let i = 2; i <= paginacao.total; i++) {
        const { itens: moreCars } = await performGetCars(active, i, size);
        itens.push(...moreCars);
    }

    return itens;
}

export async function createCar(car: { nome: string; marca: string; preco: number; anoFabricacao: number; }): Promise<string> {
    await authenticate();

    const res = await fetch(`${env.BHUT_URL}/v1/carro`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `${authInfo!.tokenType} ${authInfo!.accessToken}`,
        },
        body: JSON.stringify(car),
    });

    if (!res.ok) {
        throw new BHUTError('Failed to create car', res.status);
    }

    const data = await res.json();
    return data.id;
}

async function performGetCars(active: boolean, page: number, size: number): Promise<{ paginacao: Pagination; itens: Car[]; }> {
    await authenticate();

    const res = await fetch(`${env.BHUT_URL}/v1/carro?ativo=${active}&pagina=${page}&tamanhoPagina=${size}`, {
        headers: {
            Authorization: `${authInfo!.tokenType} ${authInfo!.accessToken}`,
        },
    });

    if (!res.ok) {
        throw new BHUTError('Failed to fetch cars', res.status);
    }

    return await res.json();
}

async function authenticate(): Promise<void> {
    if (authInfo && authInfo.expiresAt > new Date()) {
        return;
    }

    if (authInfo) {
        authInfo = await performTokenRefresh();
    } else {
        authInfo = await performAuthentication();
    }
}

async function performAuthentication(): Promise<AuthInfo> {
    const res = await fetch(`${env.BHUT_URL}/v1/autenticacao/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            login: env.BHUT_USERNAME,
            senha: env.BHUT_PASSWORD,
        }),
    });

    if (!res.ok) {
        throw new BHUTError('Failed to authenticate', res.status);
    }

    const data = await res.json();
    return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenType: data.tokenType,
        expiresAt: new Date(Date.now() + (data.expiresIn - 1) * 1000),
    };
}

async function performTokenRefresh(): Promise<AuthInfo> {
    if (!authInfo) {
        throw new BHUTError('No auth info available', 0);
    }

    const res = await fetch(`${env.BHUT_URL}/v1/autenticacao/renova-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tokenRenovado: authInfo.refreshToken,
        }),
    });

    if (!res.ok) {
        throw new BHUTError('Failed to refresh token', res.status);
    }

    const data = await res.json();
    return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenType: data.tokenType,
        expiresAt: new Date(Date.now() + (data.expiresIn - 1) * 1000),
    };
}
