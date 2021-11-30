import rateLimit from "express-rate-limit";

//ограничитель запросов на регистрацию
export const limiterRegister = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 минут
    max: 1, // максимальное кол-во запросов с одного ip
});

//ограничитель запросов на обновление информации о пользователе
export const limiterChangeData = rateLimit({
    windowMs: 1 * 60 * 1000, // 30 минут
    max: 1, // максимальное кол-во запросов с одного ip
});