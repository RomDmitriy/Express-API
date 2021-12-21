import rateLimit from "express-rate-limit";

//ограничитель запросов на регистрацию
export const limiterRegister = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 минут
    max: 5, // максимальное кол-во запросов с одного ip
});

//ограничитель запросов на обновление информации о пользователе
export const limiterChangeData = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 минута
    max: 5, // максимальное кол-во запросов с одного ip
});