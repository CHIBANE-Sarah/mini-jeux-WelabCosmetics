<?php

namespace App\Controller;

use App\Entity\AssociationQuestion;
use App\Entity\CrosswordQuestion;
use App\Entity\Ingredient;
use App\Repository\GameRepository;
use App\Repository\AssociationQuestionRepository;
use App\Repository\CrosswordQuestionRepository;
use App\Repository\IngredientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * GameController — Gestion admin des jeux (gérer les jeux).
 * Toutes ces routes nécessitent ROLE_ADMIN.
 */
#[Route('/api/admin/games', name: 'api_admin_game_')]
#[IsGranted('ROLE_ADMIN')]
class GameController extends AbstractController
{
    // ─────────────────────────────────────────────
    // 1. Liste de tous les jeux
    // ─────────────────────────────────────────────

    /**
     * GET /api/admin/games
     * Retourne tous les jeux avec leurs questions/ingrédients.
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(GameRepository $gameRepository): JsonResponse
    {
        $games = $gameRepository->findAll();

        return $this->json(array_map([$this, 'serializeGame'], $games));
    }

    // ─────────────────────────────────────────────
    // 2. Détail d'un jeu
    // ─────────────────────────────────────────────

    /**
     * GET /api/admin/games/{id}
     * Retourne le détail complet d'un jeu (type + questions/ingrédients).
     */
    #[Route('/{id}', name: 'detail', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function detail(int $id, GameRepository $gameRepository): JsonResponse
    {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serializeGame($game, true));
    }

    // ─────────────────────────────────────────────
    // 3. Association — CRUD des questions
    // ─────────────────────────────────────────────

    /**
     * GET /api/admin/games/{id}/association/questions
     */
    #[Route('/{id}/association/questions', name: 'assoc_questions_list', methods: ['GET'])]
    public function listAssocQuestions(
        int $id,
        GameRepository $gameRepository,
        AssociationQuestionRepository $repo
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $questions = $repo->findBy(['game' => $game]);

        return $this->json(array_map([$this, 'serializeAssocQuestion'], $questions));
    }

    /**
     * POST /api/admin/games/{id}/association/questions
     * Body : { "terme": "...", "definitions": [...], "bonneReponse": "..." }
     */
    #[Route('/{id}/association/questions', name: 'assoc_questions_add', methods: ['POST'])]
    public function addAssocQuestion(
        int $id,
        Request $request,
        GameRepository $gameRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true);

        if (empty($body['terme']) || empty($body['definitions']) || empty($body['bonneReponse'])) {
            return $this->json(
                ['error' => 'Champs requis : terme, definitions (tableau), bonneReponse'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $q = new AssociationQuestion();
        $q->setTerme($body['terme']);
        $q->setDefinitions((array) $body['definitions']);
        $q->setBonneReponse($body['bonneReponse']);
        $q->setGame($game);

        $em->persist($q);
        $em->flush();

        return $this->json($this->serializeAssocQuestion($q), Response::HTTP_CREATED);
    }

    /**
     * PUT /api/admin/games/{id}/association/questions/{questionId}
     * Body : { "terme": "...", "definitions": [...], "bonneReponse": "..." }
     */
    #[Route(
        '/{id}/association/questions/{questionId}',
        name: 'assoc_questions_update',
        methods: ['PUT'],
        requirements: ['id' => '\d+', 'questionId' => '\d+']
    )]
    public function updateAssocQuestion(
        int $id,
        int $questionId,
        Request $request,
        GameRepository $gameRepository,
        AssociationQuestionRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $q = $repo->find($questionId);
        if (!$q || $q->getGame() !== $game) {
            return $this->json(['error' => 'Question introuvable'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true);

        if (!empty($body['terme'])) {
            $q->setTerme($body['terme']);
        }
        if (!empty($body['definitions'])) {
            $q->setDefinitions((array) $body['definitions']);
        }
        if (!empty($body['bonneReponse'])) {
            $q->setBonneReponse($body['bonneReponse']);
        }

        $em->flush();

        return $this->json($this->serializeAssocQuestion($q));
    }

    /**
     * DELETE /api/admin/games/{id}/association/questions/{questionId}
     */
    #[Route(
        '/{id}/association/questions/{questionId}',
        name: 'assoc_questions_delete',
        methods: ['DELETE'],
        requirements: ['id' => '\d+', 'questionId' => '\d+']
    )]
    public function deleteAssocQuestion(
        int $id,
        int $questionId,
        GameRepository $gameRepository,
        AssociationQuestionRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $q = $repo->find($questionId);
        if (!$q || $q->getGame() !== $game) {
            return $this->json(['error' => 'Question introuvable'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($q);
        $em->flush();

        return $this->json(['message' => 'Question supprimée'], Response::HTTP_OK);
    }

    // ─────────────────────────────────────────────
    // 4. Crossword — CRUD des questions
    // ─────────────────────────────────────────────

    /**
     * GET /api/admin/games/{id}/crossword/questions
     */
    #[Route('/{id}/crossword/questions', name: 'crossword_questions_list', methods: ['GET'])]
    public function listCrosswordQuestions(
        int $id,
        GameRepository $gameRepository,
        CrosswordQuestionRepository $repo
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // CrosswordQuestion est lié à Session, on passe par la session du jeu
        $questions = $repo->findBy(['session' => $game->getSession()]);

        return $this->json(array_map([$this, 'serializeCrosswordQuestion'], $questions));
    }

    /**
     * POST /api/admin/games/{id}/crossword/questions
     * Body : { "definition": "...", "motCorrect": "..." }
     */
    #[Route('/{id}/crossword/questions', name: 'crossword_questions_add', methods: ['POST'])]
    public function addCrosswordQuestion(
        int $id,
        Request $request,
        GameRepository $gameRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true);
        if (empty($body['definition']) || empty($body['motCorrect'])) {
            return $this->json(
                ['error' => 'Champs requis : definition, motCorrect'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $q = new CrosswordQuestion();
        $q->setDefinition($body['definition']);
        $q->setMotCorrect(strtoupper($body['motCorrect']));
        $q->setSession($game->getSession());

        $em->persist($q);
        $em->flush();

        return $this->json($this->serializeCrosswordQuestion($q), Response::HTTP_CREATED);
    }

    /**
     * PUT /api/admin/games/{id}/crossword/questions/{questionId}
     */
    #[Route(
        '/{id}/crossword/questions/{questionId}',
        name: 'crossword_questions_update',
        methods: ['PUT'],
        requirements: ['id' => '\d+', 'questionId' => '\d+']
    )]
    public function updateCrosswordQuestion(
        int $id,
        int $questionId,
        Request $request,
        GameRepository $gameRepository,
        CrosswordQuestionRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $q = $repo->find($questionId);
        if (!$q || $q->getSession() !== $game->getSession()) {
            return $this->json(['error' => 'Question introuvable'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true);
        if (!empty($body['definition'])) {
            $q->setDefinition($body['definition']);
        }
        if (!empty($body['motCorrect'])) {
            $q->setMotCorrect(strtoupper($body['motCorrect']));
        }

        $em->flush();

        return $this->json($this->serializeCrosswordQuestion($q));
    }

    /**
     * DELETE /api/admin/games/{id}/crossword/questions/{questionId}
     */
    #[Route(
        '/{id}/crossword/questions/{questionId}',
        name: 'crossword_questions_delete',
        methods: ['DELETE'],
        requirements: ['id' => '\d+', 'questionId' => '\d+']
    )]
    public function deleteCrosswordQuestion(
        int $id,
        int $questionId,
        GameRepository $gameRepository,
        CrosswordQuestionRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $q = $repo->find($questionId);
        if (!$q || $q->getSession() !== $game->getSession()) {
            return $this->json(['error' => 'Question introuvable'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($q);
        $em->flush();

        return $this->json(['message' => 'Question supprimée']);
    }

    // ─────────────────────────────────────────────
    // 5. Formulation — CRUD des ingrédients
    // ─────────────────────────────────────────────

    /**
     * GET /api/admin/games/{id}/formulation/ingredients
     */
    #[Route('/{id}/formulation/ingredients', name: 'formulation_ingredients_list', methods: ['GET'])]
    public function listIngredients(
        int $id,
        GameRepository $gameRepository,
        IngredientRepository $repo
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $ingredients = $repo->findBy(['session' => $game->getSession()]);

        return $this->json(array_map([$this, 'serializeIngredient'], $ingredients));
    }

    /**
     * POST /api/admin/games/{id}/formulation/ingredients
     * Body : { "nom": "...", "categorie": "...", "estCorrect": true }
     */
    #[Route('/{id}/formulation/ingredients', name: 'formulation_ingredients_add', methods: ['POST'])]
    public function addIngredient(
        int $id,
        Request $request,
        GameRepository $gameRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true);
        if (empty($body['nom']) || empty($body['categorie']) || !isset($body['estCorrect'])) {
            return $this->json(
                ['error' => 'Champs requis : nom, categorie, estCorrect'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $i = new Ingredient();
        $i->setNom($body['nom']);
        $i->setCategorie($body['categorie']);
        $i->setEstCorrect((bool) $body['estCorrect']);
        $i->setSession($game->getSession());

        $em->persist($i);
        $em->flush();

        return $this->json($this->serializeIngredient($i), Response::HTTP_CREATED);
    }

    /**
     * PUT /api/admin/games/{id}/formulation/ingredients/{ingredientId}
     */
    #[Route(
        '/{id}/formulation/ingredients/{ingredientId}',
        name: 'formulation_ingredients_update',
        methods: ['PUT'],
        requirements: ['id' => '\d+', 'ingredientId' => '\d+']
    )]
    public function updateIngredient(
        int $id,
        int $ingredientId,
        Request $request,
        GameRepository $gameRepository,
        IngredientRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $ingredient = $repo->find($ingredientId);
        if (!$ingredient || $ingredient->getSession() !== $game->getSession()) {
            return $this->json(['error' => 'Ingrédient introuvable'], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true);
        if (!empty($body['nom'])) {
            $ingredient->setNom($body['nom']);
        }
        if (!empty($body['categorie'])) {
            $ingredient->setCategorie($body['categorie']);
        }
        if (isset($body['estCorrect'])) {
            $ingredient->setEstCorrect((bool) $body['estCorrect']);
        }

        $em->flush();

        return $this->json($this->serializeIngredient($ingredient));
    }

    /**
     * DELETE /api/admin/games/{id}/formulation/ingredients/{ingredientId}
     */
    #[Route(
        '/{id}/formulation/ingredients/{ingredientId}',
        name: 'formulation_ingredients_delete',
        methods: ['DELETE'],
        requirements: ['id' => '\d+', 'ingredientId' => '\d+']
    )]
    public function deleteIngredient(
        int $id,
        int $ingredientId,
        GameRepository $gameRepository,
        IngredientRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($id);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        $ingredient = $repo->find($ingredientId);
        if (!$ingredient || $ingredient->getSession() !== $game->getSession()) {
            return $this->json(['error' => 'Ingrédient introuvable'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($ingredient);
        $em->flush();

        return $this->json(['message' => 'Ingrédient supprimé']);
    }

    // ─────────────────────────────────────────────
    // Sérialisation
    // ─────────────────────────────────────────────

    private function serializeGame(\App\Entity\Game $game, bool $withContent = false): array
    {
        $data = [
            'id'          => $game->getId(),
            'type'        => $game->getType(),
            'sessionId'   => $game->getSession()?->getId(),
            'sessionCode' => $game->getSession()?->getCodeSession(),
            'sessionTitre'=> $game->getSession()?->getTitreSession(),
            'nbQuestions' => 0,
        ];

        if ($game->getType() === \App\Entity\Game::TYPE_ASSOCIATION) {
            $data['nbQuestions'] = $game->getAssociationQuestions()->count();
            if ($withContent) {
                $data['questions'] = array_map(
                    [$this, 'serializeAssocQuestion'],
                    $game->getAssociationQuestions()->toArray()
                );
            }
        }

        return $data;
    }

    private function serializeAssocQuestion(AssociationQuestion $q): array
    {
        return [
            'id'          => $q->getId(),
            'terme'       => $q->getTerme(),
            'definitions' => $q->getDefinitions(),
            'bonneReponse'=> $q->getBonneReponse(),
        ];
    }

    private function serializeCrosswordQuestion(CrosswordQuestion $q): array
    {
        return [
            'id'         => $q->getId(),
            'definition' => $q->getDefinition(),
            'motCorrect' => $q->getMotCorrect(),
        ];
    }

    private function serializeIngredient(Ingredient $i): array
    {
        return [
            'id'         => $i->getId(),
            'nom'        => $i->getNom(),
            'categorie'  => $i->getCategorie(),
            'estCorrect' => $i->getEstCorrect(),
        ];
    }
}