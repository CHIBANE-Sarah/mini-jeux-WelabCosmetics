<?php

// Namespace du contrôleur dans le projet Symfony.
namespace App\Controller;

// Entités utilisées dans ce contrôleur.
use App\Entity\AssociationQuestion;
use App\Entity\CrosswordQuestion;
use App\Entity\Ingredient;

// Repositories utilisés pour accéder aux jeux, questions et ingrédients.
use App\Repository\GameRepository;
use App\Repository\AssociationQuestionRepository;
use App\Repository\CrosswordQuestionRepository;
use App\Repository\IngredientRepository;

// EntityManager permet d'enregistrer, modifier ou supprimer des données.
use Doctrine\ORM\EntityManagerInterface;

// Classe de base des contrôleurs Symfony.
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Classes Symfony pour gérer les réponses JSON, les requêtes et les codes HTTP.
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

// Attributs Symfony pour déclarer les routes et protéger l'accès.
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

// Toutes les routes de ce contrôleur commencent par /api/admin/games.
// Le contrôleur entier est réservé aux utilisateurs ROLE_ADMIN.
#[Route('/api/admin/games', name: 'api_admin_game_')]
#[IsGranted('ROLE_ADMIN')]
class GameController extends AbstractController
{
    // Route GET /api/admin/games
    // Retourne la liste de tous les jeux.
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(
        GameRepository $gameRepository,
        CrosswordQuestionRepository $crosswordRepo,
        IngredientRepository $ingredientRepo
    ): JsonResponse {
        // Récupère tous les jeux en base.
        $games = $gameRepository->findAll();

        // Sérialise chaque jeu pour l'envoyer au frontend en JSON.
        return $this->json(array_map(
            fn($g) => $this->serializeGame($g, false, $crosswordRepo, $ingredientRepo),
            $games
        ));
    }

    // Route GET /api/admin/games/{id}
    // Retourne le détail d'un jeu précis.
    #[Route('/{id}', name: 'detail', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function detail(
        int $id,
        GameRepository $gameRepository,
        CrosswordQuestionRepository $crosswordRepo,
        IngredientRepository $ingredientRepo
    ): JsonResponse {
        // Recherche le jeu par son id.
        $game = $gameRepository->find($id);

        // Si le jeu n'existe pas, retourne une erreur 404.
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Retourne le jeu sérialisé avec son contenu si nécessaire.
        return $this->json($this->serializeGame($game, true, $crosswordRepo, $ingredientRepo));
    }

    // Route GET /api/admin/games/{id}/association/questions
    // Liste les questions d'association d’un jeu.
    #[Route('/{id}/association/questions', name: 'assoc_questions_list', methods: ['GET'])]
    public function listAssocQuestions(
        int $id,
        GameRepository $gameRepository,
        AssociationQuestionRepository $repo
    ): JsonResponse {
        // Recherche le jeu concerné.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Récupère les questions liées à ce jeu.
        $questions = $repo->findBy(['game' => $game]);

        // Retourne les questions sérialisées.
        return $this->json(array_map([$this, 'serializeAssocQuestion'], $questions));
    }

    // Route POST /api/admin/games/{id}/association/questions
    // Ajoute une question d'association.
    #[Route('/{id}/association/questions', name: 'assoc_questions_add', methods: ['POST'])]
    public function addAssocQuestion(
        int $id,
        Request $request,
        GameRepository $gameRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        // Recherche le jeu concerné.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Décode le JSON envoyé par Angular.
        $body = json_decode($request->getContent(), true);

        // Vérifie les champs obligatoires.
        if (empty($body['terme']) || empty($body['definitions']) || empty($body['bonneReponse'])) {
            return $this->json(
                ['error' => 'Champs requis : terme, definitions (tableau), bonneReponse'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Crée une nouvelle question d'association.
        $q = new AssociationQuestion();
        $q->setTerme($body['terme']);
        $q->setDefinitions((array) $body['definitions']);
        $q->setBonneReponse($body['bonneReponse']);
        $q->setGame($game);

        // Enregistre en base.
        $em->persist($q);
        $em->flush();

        // Retourne la question créée.
        return $this->json($this->serializeAssocQuestion($q), Response::HTTP_CREATED);
    }

    // Route PUT /api/admin/games/{id}/association/questions/{questionId}
    // Modifie une question d'association.
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
        // Vérifie que le jeu existe.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Recherche la question à modifier.
        $q = $repo->find($questionId);

        // Vérifie que la question existe et appartient bien à ce jeu.
        if (!$q || $q->getGame() !== $game) {
            return $this->json(['error' => 'Question introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Décode les données envoyées.
        $body = json_decode($request->getContent(), true);

        // Met à jour uniquement les champs fournis.
        if (!empty($body['terme'])) {
            $q->setTerme($body['terme']);
        }

        if (!empty($body['definitions'])) {
            $q->setDefinitions((array) $body['definitions']);
        }

        if (!empty($body['bonneReponse'])) {
            $q->setBonneReponse($body['bonneReponse']);
        }

        // flush suffit car l'entité est déjà gérée par Doctrine.
        $em->flush();

        return $this->json($this->serializeAssocQuestion($q));
    }

    // Route DELETE /api/admin/games/{id}/association/questions/{questionId}
    // Supprime une question d'association.
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
        // Vérifie que le jeu existe.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Recherche la question.
        $q = $repo->find($questionId);

        // Vérifie que la question appartient bien à ce jeu.
        if (!$q || $q->getGame() !== $game) {
            return $this->json(['error' => 'Question introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Supprime la question.
        $em->remove($q);
        $em->flush();

        return $this->json(['message' => 'Question supprimée'], Response::HTTP_OK);
    }

    // Route GET /api/admin/games/{id}/crossword/questions
    // Liste les questions de mots croisés liées à la session du jeu.
    #[Route('/{id}/crossword/questions', name: 'crossword_questions_list', methods: ['GET'])]
    public function listCrosswordQuestions(
        int $id,
        GameRepository $gameRepository,
        CrosswordQuestionRepository $repo
    ): JsonResponse {
        // Recherche le jeu.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Les questions crossword sont liées à une session, pas directement au Game.
        $questions = $repo->findBy(['session' => $game->getSession()]);

        return $this->json(array_map([$this, 'serializeCrosswordQuestion'], $questions));
    }

    // Route POST /api/admin/games/{id}/crossword/questions
    // Ajoute une question de mots croisés.
    #[Route('/{id}/crossword/questions', name: 'crossword_questions_add', methods: ['POST'])]
    public function addCrosswordQuestion(
        int $id,
        Request $request,
        GameRepository $gameRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        // Recherche le jeu.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Décode les données envoyées.
        $body = json_decode($request->getContent(), true);

        // Vérifie les champs obligatoires.
        if (empty($body['definition']) || empty($body['motCorrect'])) {
            return $this->json(
                ['error' => 'Champs requis : definition, motCorrect'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Crée une nouvelle question crossword.
        $q = new CrosswordQuestion();
        $q->setDefinition($body['definition']);
        $q->setMotCorrect(strtoupper($body['motCorrect']));
        $q->setSession($game->getSession());

        // Enregistre en base.
        $em->persist($q);
        $em->flush();

        return $this->json($this->serializeCrosswordQuestion($q), Response::HTTP_CREATED);
    }

    // Route PUT /api/admin/games/{id}/crossword/questions/{questionId}
    // Modifie une question crossword.
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
        // Recherche le jeu.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Recherche la question.
        $q = $repo->find($questionId);

        // Vérifie que la question appartient à la session du jeu.
        if (!$q || $q->getSession() !== $game->getSession()) {
            return $this->json(['error' => 'Question introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Décode le JSON envoyé.
        $body = json_decode($request->getContent(), true);

        // Met à jour les champs fournis.
        if (!empty($body['definition'])) {
            $q->setDefinition($body['definition']);
        }

        if (!empty($body['motCorrect'])) {
            $q->setMotCorrect(strtoupper($body['motCorrect']));
        }

        $em->flush();

        return $this->json($this->serializeCrosswordQuestion($q));
    }

    // Route DELETE /api/admin/games/{id}/crossword/questions/{questionId}
    // Supprime une question crossword.
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
        // Recherche le jeu.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Recherche la question.
        $q = $repo->find($questionId);

        // Vérifie l’appartenance à la session du jeu.
        if (!$q || $q->getSession() !== $game->getSession()) {
            return $this->json(['error' => 'Question introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Supprime la question.
        $em->remove($q);
        $em->flush();

        return $this->json(['message' => 'Question supprimée']);
    }

    // Route GET /api/admin/games/{id}/formulation/ingredients
    // Liste les ingrédients liés à la session du jeu.
    #[Route('/{id}/formulation/ingredients', name: 'formulation_ingredients_list', methods: ['GET'])]
    public function listIngredients(
        int $id,
        GameRepository $gameRepository,
        IngredientRepository $repo
    ): JsonResponse {
        // Recherche le jeu.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Les ingrédients sont liés à une session.
        $ingredients = $repo->findBy(['session' => $game->getSession()]);

        return $this->json(array_map([$this, 'serializeIngredient'], $ingredients));
    }

    // Route POST /api/admin/games/{id}/formulation/ingredients
    // Ajoute un ingrédient.
    #[Route('/{id}/formulation/ingredients', name: 'formulation_ingredients_add', methods: ['POST'])]
    public function addIngredient(
        int $id,
        Request $request,
        GameRepository $gameRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        // Recherche le jeu.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Décode le JSON reçu.
        $body = json_decode($request->getContent(), true);

        // Vérifie les champs obligatoires.
        if (empty($body['nom']) || empty($body['categorie']) || !isset($body['estCorrect'])) {
            return $this->json(
                ['error' => 'Champs requis : nom, categorie, estCorrect'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Crée un nouvel ingrédient.
        $i = new Ingredient();
        $i->setNom($body['nom']);
        $i->setCategorie($body['categorie']);
        $i->setEstCorrect((bool) $body['estCorrect']);
        $i->setSession($game->getSession());

        // Enregistre en base.
        $em->persist($i);
        $em->flush();

        return $this->json($this->serializeIngredient($i), Response::HTTP_CREATED);
    }

    // Route PUT /api/admin/games/{id}/formulation/ingredients/{ingredientId}
    // Modifie un ingrédient.
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
        // Recherche le jeu.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Recherche l'ingrédient.
        $ingredient = $repo->find($ingredientId);

        // Vérifie que l'ingrédient appartient bien à la session du jeu.
        if (!$ingredient || $ingredient->getSession() !== $game->getSession()) {
            return $this->json(['error' => 'Ingrédient introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Décode le JSON.
        $body = json_decode($request->getContent(), true);

        // Met à jour les champs fournis.
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

    // Route DELETE /api/admin/games/{id}/formulation/ingredients/{ingredientId}
    // Supprime un ingrédient.
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
        // Recherche le jeu.
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Recherche l'ingrédient.
        $ingredient = $repo->find($ingredientId);

        // Vérifie son appartenance à la session du jeu.
        if (!$ingredient || $ingredient->getSession() !== $game->getSession()) {
            return $this->json(['error' => 'Ingrédient introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Supprime l’ingrédient.
        $em->remove($ingredient);
        $em->flush();

        return $this->json(['message' => 'Ingrédient supprimé']);
    }

    // Transforme une entité Game en tableau JSON.
    private function serializeGame(
        \App\Entity\Game $game,
        bool $withContent,
        CrosswordQuestionRepository $crosswordRepo,
        IngredientRepository $ingredientRepo
    ): array {
        // Nombre de questions ou éléments associés au jeu.
        $nbQuestions = 0;

        // Association : les questions sont directement liées au Game.
        if ($game->getType() === \App\Entity\Game::TYPE_ASSOCIATION) {
            $nbQuestions = $game->getAssociationQuestions()->count();

        // Crossword : les questions sont liées à la Session.
        } elseif ($game->getType() === \App\Entity\Game::TYPE_CROSSWORD) {
            $nbQuestions = $crosswordRepo->count(['session' => $game->getSession()]);

        // Formulation : on compte les ingrédients liés à la Session.
        } elseif ($game->getType() === \App\Entity\Game::TYPE_FORMULATION) {
            $nbQuestions = $ingredientRepo->count(['session' => $game->getSession()]);
        }

        // Données principales du jeu envoyées au frontend.
        $data = [
            'id'           => $game->getId(),
            'type'         => $game->getType(),
            'sessionId'    => $game->getSession()?->getId(),
            'sessionCode'  => $game->getSession()?->getCodeSession(),
            'sessionTitre' => $game->getSession()?->getTitreSession(),
            'nbQuestions'  => $nbQuestions,
        ];

        // Pour l'association, on peut inclure directement les questions si demandé.
        if ($withContent && $game->getType() === \App\Entity\Game::TYPE_ASSOCIATION) {
            $data['questions'] = array_map(
                [$this, 'serializeAssocQuestion'],
                $game->getAssociationQuestions()->toArray()
            );
        }

        return $data;
    }

    // Transforme une question d'association en tableau JSON.
    private function serializeAssocQuestion(AssociationQuestion $q): array
    {
        return [
            'id'           => $q->getId(),
            'terme'        => $q->getTerme(),
            'definitions'  => $q->getDefinitions(),
            'bonneReponse' => $q->getBonneReponse(),
        ];
    }

    // Transforme une question de mots croisés en tableau JSON.
    private function serializeCrosswordQuestion(CrosswordQuestion $q): array
    {
        return [
            'id'         => $q->getId(),
            'definition' => $q->getDefinition(),
            'motCorrect' => $q->getMotCorrect(),
        ];
    }

    // Transforme un ingrédient en tableau JSON.
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