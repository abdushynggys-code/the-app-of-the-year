-- Ещё один вид техники для скидки: «остальное».
-- Применяется командой: npm run db:push

-- Список видов закрытый: у каждого есть подпись на трёх языках, и вид без
-- подписи показать было бы нечем. Но техники приносят больше, чем шесть
-- видов — колонки, наушники, приставки. Чтобы на них тоже можно было
-- объявить скидку, добавляем «остальное».

-- Проверку в deals завели прямо в колонке, поэтому Postgres дал ей имя сам:
-- <таблица>_<колонка>_check. Снимаем её и ставим такую же, но с именем —
-- следующий, кому понадобится седьмой вид, найдёт её по имени, а не гадая.
alter table public.deals drop constraint if exists deals_kinds_check;

alter table public.deals
  add constraint deals_kinds_allowed check (
    array_length(kinds, 1) between 1 and 7
    and kinds <@ array['phone', 'tablet', 'watch', 'laptop', 'pc', 'monitor', 'other']
  );
