/**
 * @description types for Socket.IO events and data.
 */

export interface JoinRoomData {
    roomId: string;
}

export interface CodeUpdateData {
    roomId: string;
    code: string;
}

export interface RoleAssignmentData {
    role: 'mentor' | 'student';
}

export interface StudentCountData {
    count: number;
}