<?php

// Namespace du contrôleur dans le projet Symfony.
namespace App\Controller;

// Entité représentant un ingrédient.
use App\Entity\Ingredient;

// Repositories utilisés pour accéder aux ingrédients et aux sessions.
use App\Repository\IngredientRepository;
use App\Repository\SessionRepository;

// Classe de base des contrôleurs Symfony.
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Classes Symfony pour les réponses JSON et les requêtes HTTP.
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

// Attribut Route pour déclarer les routes.
use Symfony\Component\Routing\Attribute\Route;

class FormulationController extends AbstractController
{
    /**
     * Route GET /api/formulation/{sessionCode}
     * Retourne les ingrédients liés à une session.
     */
    #[Route('/api/formulation/{sessionCode}', name: 'formulation_get', methods: ['GET'])]
    public function getIngredients(
        string $sessionCode,
        SessionRepository $sessionRepository,
        IngredientRepository $ingredientRepository
    ): JsonResponse {
        // Recherche la session à partir du code fourni dans l'URL.
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($sessionCode)]);

        // Si la session n'existe pas, on retourne une erreur 404.
        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        // Récupère les ingrédients liés à cette session.
        $ingredients = $ingredientRepository->findBy(['session' => $session]);

        // Transforme les objets Ingredient en tableaux simples pour le JSON.
        // On n'envoie pas estCorrect au frontend pour éviter de dévoiler directement la solution.
        $data = array_map(fn(Ingredient $i) => [
            'id' => $i->getId(),
            'nom' => $i->getNom(),
            'categorie' => $i->getCategorie(),
        ], $ingredients);

        // Retourne les ingrédients au frontend.
        return $this->json($data);
    }

    /**
     * Route POST /api/formulation/validate
     * Vérifie les ingrédients sélectionnés par l'utilisateur.
     */
    #[Route('/api/formulation/validate', name: 'formulation_validate', methods: ['POST'])]
    public function validate(
        Request $request,
        IngredientRepository $ingredientRepository,
        SessionRepository $sessionRepository
    ): JsonResponse {
        // Décode le JSON reçu.
        $body = json_decode($request->getContent(), true);

        // Récupère le code de session et les ids d'ingrédients sélectionnés.
        $sessionCode = $body['sessionCode'] ?? null;
        $selectionIds = $body['ingredients'] ?? [];

        // Recherche la session concernée.
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($sessionCode)]);

        // Si la session n'existe pas, on retourne une erreur 404.
        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        // Récupère tous les ingrédients de la session.
        $tousIngredients = $ingredientRepository->findBy(['session' => $session]);

        // Le total correspond au nombre d'ingrédients corrects attendus.
        $score = 0;
        $total = count(array_filter($tousIngredients, fn(Ingredient $i) => $i->getEstCorrect()));
        $corrections = [];

        // Parcourt tous les ingrédients pour vérifier ceux sélectionnés.
        foreach ($tousIngredients as $ingredient) {
            // Vérifie si l'ingrédient a été sélectionné par l'utilisateur.
            $selectionne = in_array($ingredient->getId(), $selectionIds);

            // Indique si l'ingrédient faisait partie de la bonne réponse.
            $correct = $ingredient->getEstCorrect();

            // Un point est ajouté seulement si l'ingrédient sélectionné est correct.
            if ($selectionne && $correct) {
                $score++;
            }

            // Ajoute une correction détaillée pour le frontend.
            $corrections[] = [
                'id' => $ingredient->getId(),
                'nom' => $ingredient->getNom(),
                'categorie' => $ingredient->getCategorie(),
                'selectionne' => $selectionne,
                'correct' => $correct,
            ];
        }

        // Retourne le score et les corrections.
        return $this->json([
            'score' => $score,
            'total' => $total,
            'corrections' => $corrections,
        ]);
    }
}