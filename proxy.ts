import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    const USER = process.env.BASIC_AUTH_USER;
    const PASS = process.env.BASIC_AUTH_PASS;

    if (!authHeader) {
        return new NextResponse('Auth required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Private App"',
            },
        });
    }

    const encoded = authHeader.split(' ')[1];
    const decoded = atob(encoded); // <-- VUELVE A DEJAR ESTA LÍNEA ASÍ (CON `atob`)
    const [user, pass] = decoded.split(':');

    if (user === USER && pass === PASS) {
        return NextResponse.next();
    }

    return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Private App"',
        },
    });
}

